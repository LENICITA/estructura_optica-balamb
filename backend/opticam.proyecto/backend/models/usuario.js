// models/usuario.js (TEMPORAL - según tu tabla USUARIOS)
const db = require('../config/config');

const Usuario = {
  findById: (id, callback) => {
    db.query(
      `SELECT id_usuario, nombre_completo, telefono, fecha_nacimiento, 
              documento, ciudad, direccion, fecha_registro, email, estado
       FROM USUARIOS 
       WHERE id_usuario = ?`,
      [id],
      (err, users) => {
        if (err) return callback(err, null);
        callback(null, users && users.length > 0 ? users[0] : null);
      }
    );
  },
  
  // Opcional: para login (si lo necesita)
  findByEmail: (email, callback) => {
    db.query(
      `SELECT * FROM USUARIOS WHERE email = ?`,
      [email],
      (err, users) => {
        if (err) return callback(err, null);
        callback(null, users && users.length > 0 ? users[0] : null);
      }
    );
  }
};

module.exports = Usuario;