export const LOGINKEY = 'subway-login'
export const STORAGEKEY = 'subway-storage'

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
        flag: stop.flag,
        uid: stop.uid,
        sid: stop.sid
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

function getRawStations () {
  return _(stationData).flatMap((line) =>
    line.stops)
}

export const GetRawStations = _.once(getRawStations)

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
    .flatMap(line =>
      line.stops.map((stop, stopIndex) => {
        return {
          name: stop.name,
          lineId: stop.line_id,
          value: stop.position,
          inStationIndex: stopIndex,
          isChange: stop.flag - 1
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

export function GetSTime (time) {
  time += 360
  let h = Math.floor(time / 60).toString()
  let m = (time % 60).toString()
  if (h.length === 1) h = '0' + h
  if (m.length === 1) m = '0' + m
  return h + ':' + m
}

export function GetPrice (distance) {
  let price = 0
  if (distance > 50) {
    price += (distance - 50) / 20
    distance = 50
  }
  if (distance > 40) {
    price += (distance - 40) / 10
    distance = 40
  }
  if (distance > 24) {
    price += (distance - 24) / 8
    distance = 24
  }
  if (distance > 12) {
    price += (distance - 12) / 6
    distance = 12
  }
  if (distance > 4) {
    price += (distance - 4) / 4
    distance = 4
  }
  price += 2
  return price
}

export const fromHexString = hexString =>
  new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)))

export const toHexString = bytes =>
  bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '')
