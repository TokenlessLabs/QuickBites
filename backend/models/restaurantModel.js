const { sql, poolPromise } = require('../config/db');

const RestaurantModel = {
  isRestaurantAdmin: async (UserID, RestaurantID) => {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('UserID', sql.Int, UserID)
      .input('RestaurantID', sql.Int, RestaurantID)
      .query('SELECT 1 AS Allowed FROM RestaurantAdmins WHERE UserID = @UserID AND RestaurantID = @RestaurantID');
    return result.recordset.length > 0;
  },

  // Fetch all restaurants
  getRestaurants: async () => {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query(`SELECT * FROM Restaurants ORDER BY Name`);
      if (result.recordset.length === 0) {
        return { success: false, message: 'No restaurants found' };
      }
      return { success: true, data: result.recordset };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Fetch a restaurant by its ID
  getRestaurantById: async (id) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('RestaurantID', sql.Int, id)
        .query(`SELECT * FROM Restaurants WHERE RestaurantID = @RestaurantID`);
      if (result.recordset.length === 0) {
        return { success: false, message: 'Restaurant not found' };
      }
      return { success: true, data: result.recordset[0] };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Register a new restaurant
  registerRestaurant: async (data,ProfilePic) => {
    const { UserID, Name, Description, Location, PhoneNum, OperatingHoursStart, OperatingHoursEnd } = data;
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('UserID', sql.Int, UserID)
        .input('Name', sql.NVarChar(50), Name)
        .input('Description', sql.NVarChar(sql.MAX), Description)
        .input('Location', sql.NVarChar(300), Location)
        .input('PhoneNum', sql.NVarChar(13), PhoneNum)
        .input('OperatingHoursStart', sql.Time, OperatingHoursStart)
        .input('OperatingHoursEnd', sql.Time, OperatingHoursEnd)
        .input('ProfilePic', sql.VarBinary(sql.MAX), ProfilePic)
        .execute('RegisterRestaurant');

        const newRestaurantID = result.recordset[0]?.NewRestaurantID;

      return { success: true, message: 'Restaurant registered successfully', RestaurantID: newRestaurantID };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Update an existing restaurant
  updateRestaurant: async (UserID, RestaurantID, Name, Description, Location, PhoneNum, OperatingHoursStart, OperatingHoursEnd, Status, ProfilePic = null) => {
    try {
      const pool = await poolPromise;
      const request = pool.request()
        .input('UserID', sql.Int, UserID)
        .input('RestaurantID', sql.Int, RestaurantID);
      
      if (Name) request.input('Name', sql.NVarChar(50), Name);
      if (Description) request.input('Description', sql.NVarChar(sql.MAX), Description);
      if (Location) request.input('Location', sql.NVarChar(100), Location);
      if (PhoneNum) request.input('PhoneNum', sql.NVarChar(13), PhoneNum);
      if (OperatingHoursStart) request.input('OperatingHoursStart', sql.Time, OperatingHoursStart);
      if (OperatingHoursEnd) request.input('OperatingHoursEnd', sql.Time, OperatingHoursEnd);
      if (Status) request.input('Status', sql.NVarChar(10), Status);
      if (ProfilePic) request.input('ProfilePic', sql.VarBinary(sql.MAX), ProfilePic);
      
      await request.execute('UpdateRestaurant');
      return { success: true, message: 'Restaurant updated successfully' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Delete a restaurant
  deleteRestaurant: async (UserID, RestaurantID) => {
    try {
      const pool = await poolPromise;
      await pool.request()
        .input('UserID', sql.Int, UserID)
        .input('RestaurantID', sql.Int, RestaurantID)
        .execute('DeleteRestaurant');
      return { success: true, message: 'Restaurant deleted successfully' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Search for restaurants based on various filters
  searchRestaurants: async ({ userId, filterBy=null, location=null, sortBy = 'Name' }) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('UserID', sql.Int, userId)                
        .input('FilterBy', sql.NVarChar(20), filterBy)
        .input('Location', sql.NVarChar(100), location) 
        .input('SortBy', sql.NVarChar(20), sortBy)     
        .execute('SearchRestaurants');                 

      if (result.recordset.length === 0) {
        return { success: false, message: 'No restaurants found matching the criteria' };
      }

      return { success: true, data: result.recordset };

    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Get all admins of a restaurant
  getRestaurantAdmins: async (RestaurantID) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('RestaurantID', sql.Int, RestaurantID)
        .query("SELECT U.UserID, U.Name, U.Email, U.PhoneNum, U.ProfilePic FROM Users U JOIN RestaurantAdmins RA ON U.UserID = RA.UserID WHERE RA.RestaurantID = @RestaurantID;  ")
      if (result.recordset.length === 0) {
        return { success: false, message: 'No admins found for this restaurant' };
      }
      return { success: true, data: result.recordset };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Get all staff of a restaurant
  getRestaurantStaff: async (RestaurantID) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('RestaurantID', sql.Int, RestaurantID)
        .query("SELECT U.UserID, U.Name, U.Email, U.PhoneNum, U.ProfilePic FROM Users U JOIN RestaurantStaff RS ON U.UserID = RS.UserID WHERE RS.RestaurantID = @RestaurantID;  ");
      if (result.recordset.length === 0) {
        return { success: false, message: 'No staff found for this restaurant' };
      }
      return { success: true, data: result.recordset };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Get all images of a restaurant
  getRestaurantImages: async (RestaurantID) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('RestaurantID', sql.Int, RestaurantID)
        .execute('GetRestaurantImages');
      if (result.recordset.length === 0) {
        return { success: false, message: 'No images found for this restaurant' };
      }
      return { success: true, data: result.recordset };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Assign an admin to the restaurant
  assignAdmin: async ({ RestaurantID, UserID, TargetUsername }) => {
    try {
      const pool = await poolPromise;
      await pool.request()
        .input('RestaurantID', sql.Int, RestaurantID)
        .input('UserID', sql.Int, UserID)
        .input('TargetUsername', sql.NVarChar(20), TargetUsername)
        .execute('AssignRestaurantAdmin');
      return { success: true, message: 'Admin assigned successfully' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Remove an admin from the restaurant
  removeAdmin: async ({ RestaurantID, UserID, TargetUserID }) => {
    try {
      const pool = await poolPromise;
      await pool.request()
        .input('RestaurantID', sql.Int, RestaurantID)
        .input('UserID', sql.Int, UserID)
        .input('TargetUserID', sql.Int, TargetUserID)
        .execute('RemoveRestaurantAdmin');
      return { success: true, message: 'Admin removed successfully' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Assign a staff member to the restaurant
  assignStaff: async ({ RestaurantID, UserID, TargetUsername }) => {
    try {
      const pool = await poolPromise;
      await pool.request()
        .input('RestaurantID', sql.Int, RestaurantID)
        .input('UserID', sql.Int, UserID)
        .input('TargetUsername', sql.NVarChar(20), TargetUsername)
        .execute('AssignRestaurantStaff');
      return { success: true, message: 'Staff assigned successfully' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Remove a staff member from the restaurant
  removeStaff: async ({ RestaurantID, UserID, TargetUserID }) => {
    try {
      const pool = await poolPromise;
      await pool.request()
        .input('RestaurantID', sql.Int, RestaurantID)
        .input('UserID', sql.Int, UserID)
        .input('TargetUserID', sql.Int, TargetUserID)
        .execute('RemoveRestaurantStaff');
      return { success: true, message: 'Staff removed successfully' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Add an image to the restaurant
  addImage: async ({ RestaurantID, Image, UserID }) => {
    try {
      const pool = await poolPromise;
      await pool.request()
        .input('RestaurantID', sql.Int, RestaurantID)
        .input('Image', sql.VarBinary(sql.MAX), Image)
        .input('UserID', sql.Int, UserID)
        .execute('AddRestaurantImage');
      return { success: true, message: 'Image added successfully' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Delete an image from the restaurant
  deleteImage: async ({ RestaurantID, ImageID, UserID }) => {
    try {
      const pool = await poolPromise;
      await pool.request()
        .input('RestaurantID', sql.Int, RestaurantID)
        .input('ImageID', sql.Int, ImageID)
        .input('UserID', sql.Int, UserID)
        .execute('DeleteRestaurantImage');
      return { success: true, message: 'Image deleted successfully' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Update restaurant status
  setRestaurantStatus: async ({ restaurantId, status }) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('RestaurantID', sql.Int, restaurantId)
        .input('Status', sql.NVarChar(10), status)
        .execute('SetRestaurantStatus');
      return { success: true, message: 'Restaurant status updated successfully' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Add a cuisine to a restaurant
  addCuisineToRestaurant: async ({ RestaurantID, CuisineID }) => {
    try {
      const pool = await poolPromise;
      await pool.request()
        .input('RestaurantID', sql.Int, RestaurantID)
        .input('CuisineID', sql.Int, CuisineID)
        .execute('AddCuisineToRestaurant');
      return { success: true, message: 'Cuisine added to restaurant successfully' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Remove a cuisine from a restaurant
  removeCuisineFromRestaurant: async ({ RestaurantID, CuisineID }) => {
    try {
      const pool = await poolPromise;
      await pool.request()
        .input('RestaurantID', sql.Int, RestaurantID)
        .input('CuisineID', sql.Int, CuisineID)
        .execute('RemoveCuisineFromRestaurant');
      return { success: true, message: 'Cuisine removed from restaurant successfully' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Get all cuisines for a restaurant
  getCuisinesForRestaurant: async (RestaurantID) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('RestaurantID', sql.Int, RestaurantID)
        .execute('GetCuisinesForRestaurant');
      if (result.recordset.length === 0) {
        return { success: false, message: 'No cuisines found for this restaurant' };
      }
      return { success: true, data: result.recordset };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }  
};

module.exports = RestaurantModel;
