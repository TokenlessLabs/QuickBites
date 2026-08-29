const { sql, poolPromise } = require('../config/db');

module.exports = {
  getReviewsByRestaurant: async (restaurantId) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('Restaurantid', sql.Int, restaurantId)
        .query('SELECT * FROM Reviews WHERE RestaurantID = @Restaurantid');
      return result.recordset;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getReviewsByUser: async (userId) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('Userid', sql.Int, userId)
        .query('SELECT Rating, Comment, Name FROM Reviews JOIN Restaurants ON Restaurants.RestaurantID = Reviews.RestaurantID WHERE UserID = @Userid');
      return result.recordset;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  addReview: async (userId, restaurantId, rating, comment) => {
    try {
      const pool = await poolPromise;
      const eligibility = await pool.request()
        .input('UserID', sql.Int, userId)
        .input('RestaurantID', sql.Int, restaurantId)
        .query(`
          SELECT
            CASE WHEN EXISTS (
              SELECT 1
              FROM Reservations R
              JOIN Tables T ON T.TableID = R.TableID
              WHERE R.UserID = @UserID
                AND T.RestaurantID = @RestaurantID
                AND R.Status IN ('Approved', 'Completed')
            ) THEN 1 ELSE 0 END AS HasApprovedReservation,
            CASE WHEN EXISTS (
              SELECT 1 FROM Reviews
              WHERE UserID = @UserID AND RestaurantID = @RestaurantID
            ) THEN 1 ELSE 0 END AS AlreadyReviewed;
        `);

      if (!eligibility.recordset[0].HasApprovedReservation) {
        throw new Error('You can review a restaurant after your reservation is approved.');
      }
      if (eligibility.recordset[0].AlreadyReviewed) {
        throw new Error('You have already reviewed this restaurant.');
      }

      await pool.request()
        .input('UserID', sql.Int, userId)
        .input('RestaurantID', sql.Int, restaurantId)
        .input('Rating', sql.Int, rating)
        .input('Comment', sql.NVarChar(sql.MAX), comment)
        .execute('InsertReview');
      return { message: 'Review added successfully' };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getReviewCount: async (restaurantId) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('RestaurantID', sql.Int, restaurantId)
        .execute('CountReviewsForRestaurant');
      return result.recordset[0].TotalReviews;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getAverageRating: async (restaurantId) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('RestaurantID', sql.Int, restaurantId)
        .query(`
          SELECT RestaurantID, AVG(CAST(Rating AS FLOAT)) AS AverageRating
          FROM Reviews
          WHERE RestaurantID = @RestaurantID
          GROUP BY RestaurantID
        `);
      return result.recordset[0]?.AverageRating || 0;
    } catch (error) {
      throw new Error(error.message);
    }
  },

    getTotalReservations: async (restaurantId) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('RestaurantID', sql.Int, restaurantId)
        .query(`
          SELECT COUNT(*) AS CountReservation
          FROM Reservations R
          JOIN Tables T on R.TableID = T.TableID
          WHERE T.RestaurantID = @RestaurantID;
        `);
      return result.recordset[0]?.CountReservation || 0;
    } catch (error) {
      throw new Error(error.message);
    }
  },

    getTotalRevenue: async (restaurantId) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('RestaurantID', sql.Int, restaurantId)
        .query(`
          SELECT SUM(P.Amount) AS TotalRevenue
          FROM Payments P
          JOIN Reservations R ON P.ReservationID = R.ReservationID
          JOIN Tables T ON R.TableID = T.TableID
          WHERE T.RestaurantID = @RestaurantID
            AND P.Status = 'Completed';
        `);
      return result.recordset[0]?.TotalRevenue || 0;
    } catch (error) {
      throw new Error(error.message);
    }
  },

    getNoOfAdmins: async (restaurantId) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('RestaurantID', sql.Int, restaurantId)
        .query(`
          SELECT COUNT(*) AS numAdmins
          FROM RestaurantAdmins
          WHERE RestaurantID = @RestaurantID;
        `);
      return result.recordset[0]?.numAdmins || 0;
    } catch (error) {
      throw new Error(error.message);
    }
  },

    getNoOfStaff: async (restaurantId) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('RestaurantID', sql.Int, restaurantId)
        .query(`
          SELECT COUNT(*) AS numStaff
          FROM RestaurantStaff
          WHERE RestaurantID = @RestaurantID;
        `);
      return result.recordset[0]?.numStaff || 0;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  deleteReview: async (reviewId, userId) => {
    try {
      const pool = await poolPromise;
      await pool.request()
        .input('ReviewID', sql.Int, reviewId)
        .input('UserID', sql.Int, userId)
        .execute('DeleteReview');
      return { message: 'Review deleted successfully' };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getTopRatedRestaurants: async () => {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .query(`
          SELECT r.RestaurantID, r.Name, AVG(rev.Rating) AS AverageRating
          FROM Restaurants r
          JOIN Reviews rev ON r.RestaurantID = rev.RestaurantID
          GROUP BY r.RestaurantID, r.Name
          ORDER BY AverageRating DESC
        `);
      return result.recordset;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getTopRatedByCuisine: async (cuisineName) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('CuisineName', sql.NVarChar(50), cuisineName)
        .query(`
          SELECT r.RestaurantID, r.Name, AVG(rv.Rating) AS AvgRating
          FROM Restaurants r
          JOIN Reviews rv ON r.RestaurantID = rv.RestaurantID
          JOIN RestCuisines rc ON r.RestaurantID = rc.RestaurantID
          JOIN Cuisines c ON rc.CuisineID = c.CuisineID
          WHERE c.Name = @CuisineName
          GROUP BY r.RestaurantID, r.Name
          ORDER BY AvgRating DESC
        `);
      return result.recordset;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  sortUserReviews: async (userId, sortOrder) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('UserID', sql.Int, userId)
        .input('SortOrder', sql.NVarChar(10), sortOrder)
        .execute('SortUserReviewsByRating');
      return result.recordset;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  sortRestaurantReviews: async (restaurantId, sortOrder) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('RestaurantID', sql.Int, restaurantId)
        .input('SortOrder', sql.NVarChar(10), sortOrder)
        .execute('SortRestaurantReviewsByRating');
      return result.recordset;
    } catch (error) {
      throw new Error(error.message);
    }
  }
};
