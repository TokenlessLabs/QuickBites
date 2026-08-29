const { sql, poolPromise } = require('../config/db');

const ReservationModel = {
  canManageRestaurant: async (userId, role, restaurantId) => {
    const pool = await poolPromise;
    const relationTable = role === 'Admin' ? 'RestaurantAdmins' : 'RestaurantStaff';
    const result = await pool.request()
      .input('UserID', sql.Int, userId)
      .input('RestaurantID', sql.Int, restaurantId)
      .query(`SELECT 1 AS Allowed FROM ${relationTable} WHERE UserID = @UserID AND RestaurantID = @RestaurantID`);
    return result.recordset.length > 0;
  },

  createReservationWithPayment: async (userId, tableId, time, duration, people, specialRequest) => {
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    try {
      await transaction.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);
      const result = await new sql.Request(transaction)
        .input('UserID', sql.Int, userId)
        .input('TableID', sql.Int, tableId)
        .input('Time', sql.DateTime, time)
        .input('Duration', sql.Int, duration)
        .input('People', sql.Int, people)
        .input('Request', sql.NVarChar(sql.MAX), specialRequest)
        .query(`
          IF NOT EXISTS (SELECT 1 FROM Users WHERE UserID = @UserID AND Role = 'Customer')
            THROW 50001, 'Only customers can make reservations.', 1;

          IF @Time <= GETDATE()
            THROW 50002, 'Reservation time must be in the future.', 1;

          IF @Duration <= 0 OR @People <= 0
            THROW 50003, 'Duration and number of guests must be greater than zero.', 1;

          DECLARE @Capacity INT, @Opening TIME, @Closing TIME, @RestaurantStatus NVARCHAR(10);
          SELECT
            @Capacity = T.Capacity,
            @Opening = R.OperatingHoursStart,
            @Closing = R.OperatingHoursEnd,
            @RestaurantStatus = R.Status
          FROM Tables T WITH (UPDLOCK, HOLDLOCK)
          JOIN Restaurants R ON R.RestaurantID = T.RestaurantID
          WHERE T.TableID = @TableID;

          IF @Capacity IS NULL
            THROW 50004, 'Table does not exist.', 1;

          IF @People > @Capacity
            THROW 50005, 'Number of guests exceeds the table capacity.', 1;

          IF @RestaurantStatus <> 'Open'
            THROW 50007, 'This restaurant is currently closed.', 1;

          DECLARE @OpeningDateTime DATETIME = DATEADD(DAY, DATEDIFF(DAY, 0, @Time), CAST(@Opening AS DATETIME));
          DECLARE @ClosingDateTime DATETIME = DATEADD(DAY, DATEDIFF(DAY, 0, @Time), CAST(@Closing AS DATETIME));

          IF @Closing <= @Opening
          BEGIN
            IF CAST(@Time AS TIME) < @Closing
              SET @OpeningDateTime = DATEADD(DAY, -1, @OpeningDateTime);
            ELSE
              SET @ClosingDateTime = DATEADD(DAY, 1, @ClosingDateTime);
          END

          IF @Time < @OpeningDateTime OR DATEADD(MINUTE, @Duration, @Time) > @ClosingDateTime
            THROW 50008, 'The reservation must fit within the restaurant operating hours.', 1;

          IF EXISTS (
            SELECT 1
            FROM Reservations WITH (UPDLOCK, HOLDLOCK)
            WHERE TableID = @TableID
              AND Status = 'Approved'
              AND Time < DATEADD(MINUTE, @Duration, @Time)
              AND DATEADD(MINUTE, Duration, Time) > @Time
          )
            THROW 50006, 'This table was just reserved for the selected time. Please choose another table.', 1;

          DECLARE @InsertedReservation TABLE (ReservationID INT);
          INSERT INTO Reservations (UserID, TableID, Time, Duration, People, Request)
          OUTPUT inserted.ReservationID INTO @InsertedReservation
          VALUES (@UserID, @TableID, @Time, @Duration, @People, @Request);

          DECLARE @ReservationID INT = (SELECT ReservationID FROM @InsertedReservation);
          INSERT INTO Payments (ReservationID, Amount, PaymentDate, Status, Method)
          VALUES (@ReservationID, 100, GETDATE(), 'Completed', 'Card');

          SELECT @ReservationID AS ReservationID;
        `);

      await transaction.commit();
      return { message: 'Reservation and payment completed successfully', data: result.recordset[0].ReservationID };
    } catch (error) {
      if (transaction._aborted !== true) {
        try { await transaction.rollback(); } catch (_) { /* transaction already closed */ }
      }
      throw new Error(error.message);
    }
  },

  // Add a reservation
  addReservation: async (userId, tableId, time, duration, people, request) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('UserID', sql.Int, userId)
        .input('TableID', sql.Int, tableId)
        .input('Time', sql.DateTime, time)
        .input('Duration', sql.Int, duration)
        .input('People', sql.Int, people)
        .input('Request', sql.NVarChar(sql.MAX), request)
        .execute('AddReservation');
      return { message: 'Reservation added successfully', data: result.recordset[0].ReservationID };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Modify a reservation
  modifyReservation: async (reservationId, userId, newTime, newDuration, newPeople, newRequest) => {
    try {
      const pool = await poolPromise;
      const request = pool.request()
        .input('ReservationID', sql.Int, reservationId)
        .input('UserID', sql.Int, userId);

      if (newTime) request.input('NewTime', sql.DateTime, newTime);
      if (newDuration) request.input('NewDuration', sql.Int, newDuration);
      if (newPeople) request.input('NewPeople', sql.Int, newPeople);
      if (newRequest) request.input('NewRequest', sql.NVarChar(sql.MAX), newRequest);

      await request.execute('ModifyReservation');

      return { message: 'Reservation modified successfully' };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Cancel a reservation
  cancelReservation: async (reservationId, userId) => {
    try {
      const pool = await poolPromise;
      await pool.request()
        .input('ReservationID', sql.Int, reservationId)
        .input('UserID', sql.Int, userId)
        .execute('CancelReservation');

      return { message: 'Reservation cancelled successfully' };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Approve a reservation
  approveReservation: async (reservationId, userId) => {
    try {
      const pool = await poolPromise;
      await pool.request()
        .input('ReservationID', sql.Int, reservationId)
        .input('UserID', sql.Int, userId)
        .execute('ApproveReservation');

      return { message: 'Reservation approved successfully' };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Complete a reservation
  completeReservation: async (reservationId, userId) => {
    try {
      const pool = await poolPromise;
      await pool.request()
        .input('ReservationID', sql.Int, reservationId)
        .input('UserID', sql.Int, userId)
        .execute('CompleteReservation');

      return { message: 'Reservation completed successfully' };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // View reservations for a user
  viewReservationsUser: async (userId, status = null) => {
    try {
      const pool = await poolPromise;
      const request = pool.request();

      request.input('UserID', sql.Int, userId);

      // Input for Status (only if provided)
      if (status) {
        request.input('Statuses', sql.NVarChar(sql.MAX), status);
      }

      const result = await request.execute('ViewReservationsUser');
      return result.recordset; 
    } catch (error) {
      throw new Error(error.message);
    }
  },

    // View reservations for a specific restaurant
  viewReservationsRestaurant: async (restaurantId, status = null) => {
    try {
      const pool = await poolPromise;
      const request = pool.request();

      request.input('RestaurantID', sql.Int, restaurantId);

      // Input for Status (only if provided)
      if (status) {
        request.input('Status', sql.NVarChar(sql.MAX), status);
      }

      const result = await request.execute('ViewReservationsRestaurant');
      return result.recordset; 
    } catch (error) {
      throw new Error(error.message);
    }
  },

    // View reservations for a user
  viewReservationsToday: async (restaurantId) => {
    try {
      const pool = await poolPromise;
      const request = pool.request();

      request.input('RestaurantID', sql.Int, restaurantId);

      const result = await request.execute('GetTodayApprovedReservations');
      return result.recordset; 
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Process reservation payment
  processPayment: async (reservationId, amount, method) => {
    try {
      const pool = await poolPromise;
      await pool.request()
        .input('ReservationID', sql.Int, reservationId)
        .input('Amount', sql.Int, amount)
        .input('Method', sql.NVarChar(10), method)
        .execute('ProcessReservationPayment');

      return { message: 'Payment processed successfully' };
    } catch (error) {
      throw new Error(error.message);
    }
  }
};

module.exports = ReservationModel;
