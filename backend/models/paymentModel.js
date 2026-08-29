const { sql, poolPromise } = require('../config/db');

const PaymentModel = {
  insertPayment: async (reservationId, amount, status, method, date) => {
    try {
      const pool = await poolPromise;
      await pool.request()
        .input('ReservationID', sql.Int, reservationId)
        .input('Amount', sql.Int, amount)
        .input('Status', sql.NVarChar, status)
        .input('Method', sql.NVarChar, method)
        .input('Date', sql.DateTime, date)
        .execute('InsertPayment');

      return { message: 'Payment inserted successfully' };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getUserPaymentHistory: async (userId) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('Userid', sql.Int, userId)
        .query(`
          SELECT 
              P.*, 
              Res.Name
          FROM 
              Payments P
          JOIN 
              Reservations R ON P.ReservationID = R.ReservationID
          JOIN 
              Tables T ON R.TableID = T.TableID
          JOIN 
              Restaurants Res ON T.RestaurantID = Res.RestaurantID
          WHERE 
              R.UserID = @UserID
          ORDER BY 
              P.PaymentDate DESC;
        `);

      return result.recordset;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  updatePaymentStatus: async (paymentId, newStatus) => {
    try {
      const pool = await poolPromise;
      await pool.request()
        .input('Paymentid', sql.Int, paymentId)
        .input('NewStatus', sql.NVarChar, newStatus)
        .execute('UpdatePaymentStatus');

      return { message: 'Payment status updated successfully' };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  deletePayment: async (paymentId) => {
    try {
      const pool = await poolPromise;
      await pool.request()
        .input('Paymentid', sql.Int, paymentId)
        .query(`
          DELETE FROM Payments WHERE PaymentID = @Paymentid
        `);

      return { message: 'Payment deleted successfully' };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getTotalRevenueByRestaurant: async (restaurantId) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('Restaurantid', sql.Int, restaurantId)
        .query(`
          SELECT R.RestaurantID, R.Name AS RestaurantName, SUM(P.Amount) AS TotalRevenue
          FROM Payments P
          JOIN Reservations Res ON P.ReservationID = Res.ReservationID
          JOIN Tables T ON Res.TableID = T.TableID
          JOIN Restaurants R ON T.RestaurantID = R.RestaurantID
          WHERE P.Status = 'Completed' AND R.RestaurantID = @Restaurantid
          GROUP BY R.RestaurantID, R.Name
        `);

      return result.recordset[0] || null;
    } catch (error) {
      throw new Error(error.message);
    }
  }
};

module.exports = PaymentModel;
