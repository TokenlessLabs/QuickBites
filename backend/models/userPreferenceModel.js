const { sql, poolPromise } = require('../config/db');

const UserPreferenceModel = {
    getCuisinePreferences: async (userId) => {
        try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('UserID', sql.Int, userId)
            .query(`
            SELECT Cuisines.CuisineID, Cuisines.Name, Cuisines.Description, UserPrefCuisines.UserID FROM Cuisines
            JOIN UserPrefCuisines ON Cuisines.CuisineID = UserPrefCuisines.CuisineID
            WHERE UserPrefCuisines.UserID = @UserID
            `);

        return result.recordset;
        } catch (error) {
        throw new Error(error.message);
        }
    },

    addCuisinePreference: async (userId, cuisineId) => {
        try {
        const pool = await poolPromise;
        await pool.request()
            .input('UserID', sql.Int, userId)
            .input('CuisineID', sql.Int, cuisineId)
            .execute('AddUserCuisinePreference');

        return { message: 'Cuisine preference added successfully' };
        } catch (error) {
        throw new Error(error.message);
        }
    },

    removeCuisinePreference: async (userId, cuisineId) => {
        try {
        const pool = await poolPromise;
        await pool.request()
            .input('UserID', sql.Int, userId)
            .input('CuisineID', sql.Int, cuisineId)
            .execute('RemoveUserCuisinePreference');

        return { message: 'Cuisine preference removed successfully' };
        } catch (error) {
        throw new Error(error.message);
        }
    },

    getRestaurantPreferences: async (userId) => {
        try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('UserID', sql.Int, userId)
            .query(`
            SELECT Restaurants.RestaurantID, Restaurants.Name, Restaurants.Description, Restaurants.Location, Restaurants.PhoneNum, Restaurants.OperatingHoursStart, Restaurants.OperatingHoursEnd, Restaurants.Status, Restaurants.ProfilePic, UserPrefRests.UserID FROM Restaurants
            JOIN UserPrefRests ON Restaurants.RestaurantID = UserPrefRests.RestaurantID
            WHERE UserPrefRests.UserID = @UserID
            `);

        return result.recordset;
        } catch (error) {
        throw new Error(error.message);
        }
    },
    addRestaurantPreference: async (userId, restaurantId) => {
        try {
        const pool = await poolPromise;
        await pool.request()
            .input('UserID', sql.Int, userId)
            .input('RestaurantID', sql.Int, restaurantId)
            .execute('AddUserRestaurantPreference');

        return { message: 'Restaurant preference added successfully' };
        } catch (error) {
        throw new Error(error.message);
        }
    },

    removeRestaurantPreference: async (userId, restaurantId) => {
        try {
        const pool = await poolPromise;
        await pool.request()
            .input('UserID', sql.Int, userId)
            .input('RestaurantID', sql.Int, restaurantId)
            .execute('RemoveUserRestaurantPreference');

        return { message: 'Restaurant preference removed successfully' };
        } catch (error) {
        throw new Error(error.message);
        }
    }
};

module.exports = UserPreferenceModel;
