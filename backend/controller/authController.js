const express = require('express');
const router = express.Router();
const validator = require('validator');
const registerModel = require('../models/authModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const fileUpload = require('express-fileupload');

// Initialize express-fileupload middleware
router.use(fileUpload());

module.exports.userRegister = async (req, res) => {
  // Use express-validator for form validation
  const errors = validationResult(req);

  // Check for validation errors
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { userName, email, password, confirmPassword } = req.body;

  // Check for password and confirmPassword match
  if (password !== confirmPassword) {
    return res.status(400).json({ error: "Your Password and Confirm Password do not match" });
  }

  // Check if there are uploaded files
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({ error: "Please provide a user image" });
  }

  const { image } = req.files;

  try {
    // Generate a random filename
    const randNumber = Math.floor(Math.random() * 99999);
    const newImageName = randNumber + image.name;

    // Move the uploaded file to the desired location
    const newPath = __dirname + `../../../frontend/public/image/${newImageName}`;
    image.mv(newPath, async (error) => {
      if (!error) {
        // File upload successful, proceed with user creation
        try {
          const checkUser = await registerModel.findOne({ email: email });

          if (checkUser) {
            return res.status(404).json({
              error: {
                errorMessage: ['Your email already exists'],
              },
            });
          }

          const userCreate = await registerModel.create({
            userName,
            email,
            password: await bcrypt.hash(password, 10),
            image: newImageName,
          });

          const token = jwt.sign(
            {
              id: userCreate._id,
              email: userCreate.email,
              userName: userCreate.userName,
              image: userCreate.image,
              registerTime: userCreate.createdAt,
            },
            process.env.SECRET,
            {
              expiresIn: process.env.TOKEN_EXP,
            }
          );

          const options = {
            expires: new Date(Date.now() + process.env.COOKIE_EXP * 24 * 60 * 60 * 1000),
          };

          res.status(201).cookie('authToken', token, options).json({
            successMessage: 'Your Register Successful',
            token,
          });
        } catch (error) {
          res.status(500).json({
            error: {
              errorMessage: ['Internal Server Error'],
            },
          });
        }
      } else {
        res.status(500).json({
          error: {
            errorMessage: ['Internal Server Error'],
          },
        });
      }
    });
  } catch (error) {
    res.status(500).json({
      error: {
        errorMessage: ['Internal Server Error'],
      },
    });
  }
};

module.exports.userLogin = async (req, res) => {
  const error = [];
  const { email, password } = req.body;

  // Use express-validator for form validation
  if (!email) {
    error.push('Please provide your Email');
  }
  if (!password) {
    error.push('Please provide your Password');
  }
  if (email && !validator.isEmail(email)) {
    error.push('Please provide your Valid Email');
  }

  // Check for validation errors
  if (error.length > 0) {
    return res.status(400).json({
      error: {
        errorMessage: error,
      },
    });
  }

  try {
    const checkUser = await registerModel.findOne({ email: email }).select('+password');

    if (checkUser) {
      const matchPassword = await bcrypt.compare(password, checkUser.password);

      if (matchPassword) {
        const token = jwt.sign(
          {
            id: checkUser._id,
            email: checkUser.email,
            userName: checkUser.userName,
            image: checkUser.image,
            registerTime: checkUser.createdAt,
          },
          process.env.SECRET,
          {
            expiresIn: process.env.TOKEN_EXP,
          }
        );

        const options = {
          expires: new Date(Date.now() + process.env.COOKIE_EXP * 24 * 60 * 60 * 1000),
        };

        res.status(200).cookie('authToken', token, options).json({
          successMessage: 'Your Login Successful',
          token,
        });
      } else {
        res.status(400).json({
          error: {
            errorMessage: ['Your Password is not Valid'],
          },
        });
      }
    } else {
      res.status(400).json({
        error: {
          errorMessage: ['Your Email Not Found'],
        },
      });
    }
  } catch {
    res.status(404).json({
      error: {
        errorMessage: ['Internal Server Error'],
      },
    });
  }
};

module.exports.userLogout = (req, res) => {
  res.status(200).cookie('authToken', '').json({
    success: true,
  });
};
