import BMap from 'BaiduMap'

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

function getLngLat (poi) {
  const mctXX = poi.x
  const mctYY = poi.y
  const mctXY = new BMap.Pixel(mctXX, mctYY)
  var map = new BMap.Map('main')

  const projection2 = map.getMapType().getProjection()
  const LngLat = projection2.pointToLngLat(mctXY)

  return [LngLat.lng, LngLat.lat]
}

const stationData = require('app/public/station.json')

function getLines () {
  return stationData.content.filter((value, index) => index & 1)
    .map(line => {
      return {
        coords: line.stops.map(stop => {
          return getLngLat(stop)
        })
      }
    })
}

export const GetLines = _.once(getLines)

export const NORMALSTATION = 0x1, CHANGESTATION = 0x2

function getStations () {
  const allStations = _.flatMap(stationData.content.filter((value, index) => index & 1), (line, lineIndex) =>
    line.stops.map(stop => {
      return {
        name: stop.name,
        value: getLngLat(stop),
        lineId: lineIndex + 1
      }
    })
  )

  const count = {}
  const solvedStations = []
  allStations.forEach((station) => {
    count[station.name] = station.name in count ? count[station.name] + 1 : 1
  })
  allStations.forEach((station, index) => {
    switch (count[station.name]) {
      case 0:
        break
      case 1: {
        station.flag = NORMALSTATION
        solvedStations.push(station)
        count[station.name] = 0
        break
      }
      default : {
        station.flag = CHANGESTATION
        solvedStations.push(station)
        count[station.name] = 0
        break
      }
    }
  })
  solvedStations.map((station, index) => {
    station.id = index + 1
    return station
  })

  return solvedStations
}

export const GetStations = _.once(getStations)
