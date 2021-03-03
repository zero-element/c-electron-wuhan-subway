export const mapstyle = {
  styleJson: [{
    featureType: 'water',
    elementType: 'all',
    stylers: {
      color: '#d1d1d1'
    }
  }, {
    featureType: 'land',
    elementType: 'all',
    stylers: {
      color: '#f3f3f3'
    }
  }, {
    featureType: 'railway',
    elementType: 'all',
    stylers: {
      visibility: 'off'
    }
  }, {
    featureType: 'highway',
    elementType: 'all',
    stylers: {
      color: '#fdfdfd'
    }
  }, {
    featureType: 'highway',
    elementType: 'labels',
    stylers: {
      visibility: 'off'
    }
  }, {
    featureType: 'arterial',
    elementType: 'geometry',
    stylers: {
      color: '#fefefe'
    }
  }, {
    featureType: 'arterial',
    elementType: 'geometry.fill',
    stylers: {
      color: '#fefefe'
    }
  }, {
    featureType: 'poi',
    elementType: 'all',
    stylers: {
      visibility: 'off'
    }
  }, {
    featureType: 'green',
    elementType: 'all',
    stylers: {
      visibility: 'off'
    }
  }, {
    featureType: 'subway',
    elementType: 'all',
    stylers: {
      visibility: 'off'
    }
  }, {
    featureType: 'manmade',
    elementType: 'all',
    stylers: {
      color: '#d1d1d1'
    }
  }, {
    featureType: 'local',
    elementType: 'all',
    stylers: {
      color: '#d1d1d1'
    }
  }, {
    featureType: 'arterial',
    elementType: 'labels',
    stylers: {
      visibility: 'off'
    }
  }, {
    featureType: 'boundary',
    elementType: 'all',
    stylers: {
      color: '#fefefe'
    }
  }, {
    featureType: 'building',
    elementType: 'all',
    stylers: {
      color: '#d1d1d1'
    }
  }, {
    featureType: 'label',
    elementType: 'labels.text.fill',
    stylers: {
      color: '#999999'
    }
  }]
}

import * as _ from 'lodash'

export const stationData = require('app/public/station.json')

function getLines () {
  return stationData.map(line => {
    return {
      coords: line.stops.map(stop => {
        return stop.position
      })
    }
  })
}

export const GetLines = _.once(getLines)

export const NORMALSTATION = 0x1, CHANGESTATION = 0x2

function getAllStations () {
  const allStations = _.flatMap(stationData, (line) =>
    line.stops.map(stop => {
      return {
        name: stop.name,
        value: stop.position,
        lineId: [stop.line_id],
        flag: stop.flag
      }
    })
  )

  const count = {}, lineCollection = {}
  const solvedStations = []
  allStations.forEach((station) => {
    count[station.name] = station.name in count ? count[station.name] + 1 : 1
    if (!lineCollection[station.name]) lineCollection[station.name] = []
    lineCollection[station.name].push(...station.lineId)
  })
  allStations.forEach((station, index) => {
    switch (count[station.name]) {
      case 0:
        break
      case 1: {
        station.lineId = lineCollection[station.name]
        solvedStations.push(station)
        count[station.name] = 0
        break
      }
      default: {
        station.lineId = lineCollection[station.name]
        solvedStations.push(station)
        count[station.name] = 0
        break
      }
    }
  })

  return solvedStations
}

export const GetAllStations = _.once(getAllStations)

export function GetStationCollection (lineId) {
  const stations = _(GetAllStations()).filter((station) => lineId ? _(station.lineId).includes(lineId) : true)
  const nStations = _(stations).filter((station) => station.flag === NORMALSTATION).value()
  const cStations = _(stations).filter((station) => station.flag === CHANGESTATION).value()
  return {
    nStations,
    cStations
  }
}

export function GetLineStations (lineId) {
  const stations = _(stationData).filter((value, index) => lineId ? index === lineId - 1 : true)
    .flatMap((line, lineIndex) =>
      line.stops.map((stop, stopIndex) => {
        return {
          name: stop.name,
          lineId: lineIndex + 1,
          iStationIndex: stopIndex
        }
      })
    )
  return stations.value()
}

export function GetDistance (dota, dotb) {
  var radLat1 = dota.position[1] * Math.PI / 180.0
  var radLat2 = dotb.position[1] * Math.PI / 180.0
  var a = radLat1 - radLat2
  var b = dota.position[0] * Math.PI / 180.0 - dotb.position[0] * Math.PI / 180.0
  var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
    Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)))
  s = s * 6378.137// EARTH_RADIUS;
  s = Math.round(s * 10000) / 10000
  return s
}

import * as fs from 'fs'

export function preData () {
  fs.open('output.txt', 'w+', (err, fd) => {
    if (err) { console.log(err) }
    const stopSet = {}
    stationData.map(line => {
      line.stops.reduce((last, now) => {
        if (now.uid in stopSet) {
          for (let i = 0; i < stopSet[now.uid].length; i++) {
            fs.writeFile(fd, now.uid + ' ' + now.sid + ' ' + now.uid + ' ' + stopSet[now.uid][i] + ' ' + 3.5 + ' ' + 0 + ' ' + 0 + '\n', (err) => {
              if (err) { console.log(err) }
            })
          }
          stopSet[now.uid].push(now.sid)
        } else {
          stopSet[now.uid] = [now.sid]
        }
        fs.writeFile(fd, last.uid + ' ' + last.sid + ' ' + now.uid + ' ' + now.sid + ' ' + 3 + ' ' + GetDistance(last, now) + ' ' + line.line_id + '\n', (err) => {
          if (err) { console.log(err) }
        })
        return now
      })
      return line
    })
  })
}

// export function preData () {
//   fs.open('output.txt', 'w+', (err, fd) => {
//     if (err) {
//       console.log('failed to open file')
//     }
//     let scount = 0
//     let ucount = 0
//     const nameSet = {}
//     const result = stationData.filter((value, index) => index & 1).map((line, index) => {
//       delete line.line_uid
//       delete line.pair_line_uid
//       line.line_id = index + 1
//       line.stops.map((stop) => {
//         delete stop.is_practical
//         stop.sid = scount++
//         if (stop.name in nameSet) {
//           stop.uid = nameSet[stop.name]
//         } else {
//           stop.uid = ucount++
//           nameSet[stop.name] = stop.uid
//         }
//         return stop
//       })
//       return line
//     })
//     fs.writeFile(fd, JSON.stringify(result), (err) => {
//       if (err) { console.log(err) }
//       console.log('success')
//     })
//   })
// }
