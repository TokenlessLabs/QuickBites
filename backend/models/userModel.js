const { sql, poolPromise } = require('../config/db');

const UserModel = {
  getUsers: async () => {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .query(`
            SELECT UserID, Name, Username, Email, PhoneNum, Role, ProfilePic FROM Users
        `);

        return result.recordset;
    } catch (error){
      throw new Error(error.message);
    }
  },

  getUserById: async (id) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input("UserID", sql.Int, id)
            .query(`
                SELECT UserID, Name, Username, Email, PhoneNum, Role, ProfilePic FROM Users
                WHERE UserID = @UserID
            `);

        return result.recordset[0] || null;
    } catch (error) {
        throw new Error(error.message);
    }
  },

  createUser: async (name, username, password, email, phoneNum, role, profilePic = null) => {
    let userId;
    try {
        const pool = await poolPromise;
        const request = pool.request();

        request.input('Name', sql.NVarChar, name)
            .input('Username', sql.NVarChar, username)
            .input('Password', sql.NVarChar, password)
            .input('Email', sql.NVarChar, email)
            .input('PhoneNum', sql.NVarChar, phoneNum)
            .input('Role', sql.NVarChar, role);

        if (profilePic) {
            request.input('ProfilePic', sql.VarBinary, profilePic);
        } else {
            request.input('ProfilePic', sql.VarBinary, null);
        }
        request.output('UserId', sql.Int);
        const result = await request.execute('RegisterUser');
        userId = result.output.UserId;
        return { message: 'User created successfully', userId: userId };
    } catch (error) {
        throw new Error(error.message);
    }
  }, 

  deleteUser: async (userId) => {
    try {
      const pool = await poolPromise;
      await pool.request()
        .input('UserID', sql.Int, userId)
        .execute('DeleteUser');
      return { message: 'User deleted successfully' };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  updateUser: async (userId, name, username, email, phoneNum, profilePic=null) => {
    try {
      const pool = await poolPromise;
      const request = pool.request().input('UserID', sql.Int, userId);
      if (name) {
        request.input('Name', sql.NVarChar, name);
      }
      if (username) {
        request.input('Username', sql.NVarChar, username);
      }
      if (email) {
        request.input('Email', sql.NVarChar, email);
      }
      if (phoneNum) {
        request.input('PhoneNum', sql.NVarChar, phoneNum);
      }
      if (profilePic) {
        request.input('ProfilePic', sql.VarBinary, profilePic);
    } else {
        request.input('ProfilePic', sql.VarBinary, null);
    }
      await request.execute('UpdateUser');
      return { success: true, message: 'User updated successfully' };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  authenticateUser: async (username, password) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('Username', sql.NVarChar, username)
        .input('Password', sql.NVarChar, password)
        .output('RestaurantID',sql.Int)
        .execute('AuthenticateUser');
      return {data:result.recordset[0],id:result.output.RestaurantID};
    } catch (error) {
      throw new Error(error.message);
    }
  },

  changePassword: async (userId, oldPassword, newPassword) => {
    try {
      const pool = await poolPromise;
      await pool.request()
        .input('UserID', sql.Int, userId)
        .input('OldPassword', sql.NVarChar, oldPassword)
        .input('NewPassword', sql.NVarChar, newPassword)
        .execute('ChangePassword');

      return { message: 'Password changed successfully' };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getUserReservations: async (userId) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('UserID', sql.Int, userId)
        .execute('GetUserReservations');

      return result.recordset;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getUserReviews: async (userId) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('UserID', sql.Int, userId)
        .execute('GetUserReviews');

      return result.recordset;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getMyRestaurants: async (userId) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('UserID', sql.Int, userId)
        .query(`
          SELECT 
              Restaurants.RestaurantID,
              Restaurants.Name,
              Restaurants.Description,
              Restaurants.Location,
              Restaurants.PhoneNum,
              Restaurants.OperatingHoursStart,
              Restaurants.OperatingHoursEnd,
              Restaurants.Status,
              Restaurants.ProfilePic,
              RestaurantAdmins.UserID
          FROM Restaurants
          JOIN RestaurantAdmins ON Restaurants.RestaurantID = RestaurantAdmins.RestaurantID
          WHERE RestaurantAdmins.UserID = @Userid;
        `);

      return result.recordset;
    } catch (error) {
      throw new Error(error.message);
    }
  },


  getStaffRestaurant: async (userId) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('UserID', sql.Int, userId)
        .query(`
          SELECT
            R.RestaurantID,
            R.Name,
            R.Location,
            R.Status
          FROM RestaurantStaff RS
          JOIN Restaurants R ON R.RestaurantID = RS.RestaurantID
          WHERE RS.UserID = @UserID
          ORDER BY R.Name;
        `);

      return result.recordset;
    } catch (error) {
      throw new Error(error.message);
    }
  }
};

module.exports = UserModel;
