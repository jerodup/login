import jwt from "jsonwebtoken";


// Crear un token
export const createAccessToken = (payload) => {
  return new Promise((resolve, reject) => {
    jwt.sign(
      payload,
      "xyz123",// Poner en variable de entorno
      { expiresIn: "1d" },
      (err, token) => {
        if (err) reject(err);
        resolve(token);
      }
    );    
  });
};

//verificar un token
export const verifyToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, "xyz123", (err, payload) => {
      if (err) reject(err);
      resolve(payload);
      
    });
  });
};

//verificar un refresh token
export const verifyRefreshToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, "refresh123", (err, payload) => {
      if (err) reject(err);
      resolve(payload);
      
    });
  });
};

// Crear un refresh token
export const createRefreshToken = (payload) => {
  return new Promise((resolve, reject) => {
    jwt.sign(
      payload,
      "refresh123",// Poner en variable de entorno
      { expiresIn: "7d" },
      (err, token) => {
        if (err) reject(err);
        resolve(token);
      }
    );    
  });
};