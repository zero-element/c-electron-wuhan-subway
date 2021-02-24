<template>
  <div class="echarts-map">
    <div id="main" style="height: 100%; width: 100%"></div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import 'echarts/extension/bmap/bmap'
import * as utils from 'src/libs/utils'

const stationData = require('app/public/station.json')

export default {
  name: 'Echarts',
  methods: {
    drawMap () {
      // 基于准备好的dom，初始化echarts实例
      const myChart = echarts.init(document.getElementById('main'))
      const color = ['#3d84c6', '#eb7caf', '#d9b966', '#8ec720', '#008536', '#eb7900', '#98acab', '#f2cf01']
      let option
      const lines = stationData.content.filter((value, index) => index & 1)
        .map(line => {
          return {
            coords: line.stops.map(stop => {
              return utils.getLngLat(stop)
            })
          }
        })
      console.log(lines)
      const allScatters = [].concat.apply([],
        stationData.content.filter((value, index) => index & 1)
          .map(line =>
            line.stops.map(stop => {
              return {
                name: stop.name,
                value: utils.getLngLat(stop)
              }
            })
          ))
      const scatters = []
      const exScatters = []
      const names = {}
      allScatters.forEach((scatter) => {
        names[scatter.name] = scatter.name in names ? names[scatter.name] + 1 : 1
      })
      allScatters.forEach((scatter) => {
        switch (names[scatter.name]) {
          case 0:
            break
          case 1: {
            scatters.push(scatter)
            names[scatter.name] = 0
            break
          }
          default : {
            exScatters.push(scatter)
            names[scatter.name] = 0
            break
          }
        }
      })
      let series = []
      series = series.concat(lines.map((line, index) => {
        return {
          type: 'lines',
          coordinateSystem: 'bmap',
          data: [line],
          polyline: true,
          effect: {
            constantSpeed: 20,
            show: true,
            trailLength: 0.1,
            symbolSize: 5
          },
          lineStyle: {
            color: color[index],
            opacity: 0.5,
            width: 4
          }
        }
      }))
      series.push({
        name: 'change',
        type: 'effectScatter',
        coordinateSystem: 'bmap',
        data: exScatters,
        symbolSize: 15,
        symbol: 'path://M12,2C6.48,2,2,6.48,2,12s4.48,10,10,10s10-4.48,10-10S17.52,2,12,2z M12,20c-4.41,0-8-3.59-8-8s3.59-8,8-8s8,3.59,8,8 S16.41,20,12,20z M16.17,14.76l-1.1-1.1c0.71-1.33,0.53-3.01-0.59-4.13C13.79,8.84,12.9,8.5,12,8.5c-0.03,0-0.06,0.01-0.09,0.01 L13,9.6l-1.06,1.06L9.11,7.83L11.94,5L13,6.06l-0.96,0.96c1.27,0.01,2.53,0.48,3.5,1.44C17.24,10.17,17.45,12.82,16.17,14.76z M14.89,16.17L12.06,19L11,17.94l0.95-0.95c-1.26-0.01-2.52-0.5-3.48-1.46c-1.71-1.71-1.92-4.35-0.64-6.29l1.1,1.1 c-0.71,1.33-0.53,3.01,0.59,4.13c0.7,0.7,1.63,1.04,2.56,1.01L11,14.4l1.06-1.06L14.89,16.17z',
        showEffectOn: 'render',
        rippleEffect: {
          brushType: 'stroke'
        },
        hoverAnimation: true,
        label: {
          formatter: '{b}',
          position: 'bottom',
          show: true
        },
        itemStyle: {
          shadowBlur: 10,
          shadowColor: '#FFF'
        },
        zlevel: 1
      })
      series.push({
        name: 'normal',
        type: 'scatter',
        coordinateSystem: 'bmap',
        data: scatters,
        symbolSize: 10,
        label: {
          formatter: '{b}',
          position: 'bottom'
        },
        symbol: 'circle',
        itemStyle: {
          normal: {
            color: '#FFF',
            borderColor: '#000000',
            borderWidth: 0.1
          }
        },
        emphasis: {
          label: {
            show: true
          }
        }
      })

      myChart.setOption(option = {
        bmap: {
          center: [114.32, 30.591015],
          zoom: 12,
          roam: true,
          mapStyle: utils.mapstyle
        },
        series: series
      })

      option && myChart.setOption(option)
    }
  },
  mounted () {
    this.drawMap()
  }
}
</script>

<style lang="sass">
.echarts-map
  position: fixed
  width: 100%
  top: 0px
  bottom: 0px
</style>
