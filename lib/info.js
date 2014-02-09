var exif = require('exif2')
var geocoder = require('geocoder')
var geolib = require('geolib')
var moment = require('moment')

module.exports = function info(filename, callback){
  exif(filename, function(err, info){
    if (err) return callback(err)
    
    var ret = {}
    ret.filename = info['file name']
    ret.dateTaken = parseDate(info['create date'] || info['modify date'])
    if (info.make){
      ret.camera = info.make + ' ' + (info['camera model name'] || info['model'])
    }
    ret.res = info['image size']
    ret.fileSize = info['file size']
    if (info['media duration']){
      ret.duration = info['media duration']
    }
    ret.gps = getGps(info)
    ret.fileType = info['file type']
    ret.fileSize = info['file size']
    callback(null, ret)

    /*
    if (gps){
      var location = geocoder.reverseGeocode(gps.lat, gps.long, function(err, data){
        console.log('location:', data.results[0].formatted_address)
      })
    }
    */
  })
}

function parseDate(str){
  if (!str) return null
  if (str.length === 19){
    return moment(str, 'YYYY:MM:DD HH:mm:ss').toDate()
  }else{
    return moment(str, 'YYYY:MM:DD HH:mm:ssZZ').toDate()
  }
}

function getGps(info){
  if (info['gps latitude'] && info['gps longitude']){
    var lat = convertCoord(info['gps latitude'])
    var long = convertCoord(info['gps longitude'])
    return {lat: lat, long: long}
  }else if (info['gps coordinates und us ']){
    var coords = info['gps coordinates und us ']
    var lat = convertCoord(coords.split(',')[0])
    var long = convertCoord(coords.split(',')[1])
    return {lat: lat, long: long}
  }else{
    return null
  }
}

function convertCoord(coord){
  return geolib.useDecimal(coord.replace(' deg', '°'))
}