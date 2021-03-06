var bcrypt = require('bcrypt');
var _ = require('underscore');
var cryptojs = require('crypto-js');
var jwt = require('jsonwebtoken');

module.exports = function (sequelInst, DataTypes){
  var user = sequelInst.define('user', {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    salt: {
      type: DataTypes.STRING
    },
    hashedPassword: {
      type: DataTypes.STRING
    },
    password: {
      type: DataTypes.VIRTUAL,
      allowNull: false,
      validate: {
        len: [7, 100]
      },
      set: function(value){
        var salt = bcrypt.genSaltSync(10);
        var hashedPassword = bcrypt.hashSync(value, salt);

        this.setDataValue('password', value);
        this.setDataValue('salt', salt);
        this.setDataValue('hashedPassword', hashedPassword);
      }
    }

  },
  {
    hooks: {
      beforeValidate: function(user, options){
        if (typeof user.email == 'string' ){
          user.email = user.email.toLowerCase();
        }
      }
    },
    classMethods:{
      authenticate: function(body){
        return new Promise( function(resolve, reject){
          if(typeof body.email == 'string' && body.email.length > 0 && typeof body.password == 'string' && body.password.length > 0) {
            body.email = body.email.toLowerCase();
            user.findOne({
              where: {
                email: body.email
              }
            })
            .then(function(user){
              if(!user || !bcrypt.compareSync(body.password, user.get('hashedPassword'))){
                return reject();
              }else {
                resolve(user);
              }


            }, function(e){
              return reject();
            })

          }
          else {
            return reject();
          }
        })
      },
      findByToken: function(token){
        return new Promise(function(resolve, reject){
          try{
            var decryptedJWT = jwt.verify(token, 'FluckU^54@');
            var decryptedToken = cryptojs.AES.decrypt(decryptedJWT.token, 'AAAA123456');
            var tokenData = JSON.parse(decryptedToken.toString(cryptojs.enc.Utf8));
            console.log(tokenData);

            user.findById(tokenData.id).then(function(user){
              if(user){
                resolve(user);
              }
              else {
                reject();
              }
            }, function(e){
              reject();
            })
          }catch(e){
            reject();
          }


        });
      }
    },
    instanceMethods:{
      toPublicJSON: function(){
        var json = this.toJSON();
        return _.pick(json, 'id', 'email', 'createdAt', 'updatedAt');

      },
      generateToken: function(type){
        if(!_.isString(type)){
          return undefined;
        }
        try {
          var userId = this.get('id');
          var stringData = JSON.stringify({ id: userId, type: type});
          var encryptedData = cryptojs.AES.encrypt(stringData, 'AAAA123456').toString();
          var token = jwt.sign({
            token: encryptedData
          }, 'FluckU^54@');
          return token;
        } catch (e){
          console.log (userId);
          console.log(e);
          return undefined;
        }
      }
    }
  });
  return user;
};
