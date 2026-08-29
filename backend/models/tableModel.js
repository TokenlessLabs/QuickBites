const { sql, poolPromise } = require('../config/db');

const TableModel = {
  getTablesByRestaurant: async (id) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input("Restaurantid", sql.Int, id)
        .query(`
            SELECT * FROM Tables WHERE RestaurantID = @Restaurantid
        `);
        return result.recordset;
    } catch (error){
      throw new Error(error.message);
    }
  },

  checkTableAvailability: async (tableId) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('TableID', sql.Int, tableId)
        .execute('CheckTableAvailability');
      return result.recordset[0];
    } catch (error) {
      throw new Error(error.message);
    }
  },

  addTable: async (userId, capacity, description, restaurantId) => {
    try {
      const pool = await poolPromise;
      await pool.request()
        .input('UserID', sql.Int, userId)
        .input('Capacity', sql.Int, capacity)
        .input('Description', sql.NVarChar(sql.MAX), description)
        .input('RestaurantID', sql.Int, restaurantId)
        .execute('AddTable');
      return { message: 'Table added successfully.' };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  updateTable: async (userId, tableId, capacity = null, status = null, description = null) => {
    try {
      const pool = await poolPromise;
      await pool.request()
        .input('UserID', sql.Int, userId)
        .input('TableID', sql.Int, tableId)
        .input('Capacity', sql.Int, capacity)
        .input('Status', sql.NVarChar(10), status)
        .input('Description', sql.NVarChar(sql.MAX), description)
        .execute('UpdateTable');
      return { message: 'Table updated successfully.' };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  deleteTable: async (userId, tableId) => {
    try {
      const pool = await poolPromise;
      await pool.request()
        .input('UserID', sql.Int, userId)
        .input('TableID', sql.Int, tableId)
        .execute('DeleteTable');
      return { message: 'Table deleted successfully.' };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  updateTableStatus: async (userId, tableId, newStatus) => {
    try {
      const pool = await poolPromise;
      await pool.request()
        .input('UserID', sql.Int, userId)
        .input('TableID', sql.Int, tableId)
        .input('NewStatus', sql.NVarChar(10), newStatus)
        .execute('UpdateTableStatus');
      return { message: 'Table status updated.' };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getAvailableTables: async (restaurantId) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('RestaurantID', sql.Int, restaurantId)
        .execute('GetAvailableTables');
      return result.recordset;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getTablesByCapacity: async (restaurantId, minCapacity = null) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('RestaurantID', sql.Int, restaurantId)
        .input('MinCapacity', sql.Int, minCapacity)
        .execute('GetTablesByCapacity');
      return result.recordset;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getTablesByCapacityAndTime: async (restaurantId, minCapacity = null, startTime, durationMinutes) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('RestaurantID', sql.Int, restaurantId)
        .input('MinCapacity', sql.Int, minCapacity)
        .input('StartTime', sql.DateTime, startTime)
        .input('DurationMinutes', sql.Int, durationMinutes)
        .execute('GetAvailableTablesByCapacityAndTime');
      return result.recordset;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  resetTablesAtClosing: async (restaurantId) => {
    try {
      const pool = await poolPromise;
      await pool.request()
        .input('RestaurantID', sql.Int, restaurantId)
        .execute('ResetTablesAtClosing');
      return { message: 'Tables reset after closing time.' };
    } catch (error) {
      throw new Error(error.message);
    }
  }

};

module.exports = TableModel;
