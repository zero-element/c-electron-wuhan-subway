<template>
  <div class="echarts-map">
    <div id="main" style="height: 100%; width: 100%"></div>
  </div>
</template>

<script>
import 'echarts/extension/bmap/bmap'
import * as echarts from 'echarts'
import * as utils from 'src/libs/utils'
import * as _ from 'lodash'

const ipcRenderer = require('electron').ipcRenderer

export default {
  name: 'Echarts',
  data () {
    return {
      myChart: null,
      resizeDB: null
    }
  },
  methods: {
    drawMap (lineId) {
      const color = ['#3d84c6', '#eb7caf', '#d9b966', '#8ec720', '#008536', '#eb7900', '#98acab', '#f2cf01']
      const lines = utils.GetLines()
      console.log(lineId)
      console.log(lines)
      const stations = _(utils.GetStations()).filter((station) => lineId ? station.lineId === lineId : true)
      const nStations = _(stations).filter((station) => station.flag === utils.NORMALSTATION).value()
      const cStations = _(stations).filter((station) => station.flag === utils.CHANGESTATION).value()
      // map数据
      let series = []
      series = _(lines).map((line, index) => {
        return {
          type: 'lines',
          coordinateSystem: 'bmap',
          data: [line],
          polyline: true,
          effect: {
            constantSpeed: 20,
            show: true,
            trailLength: 0.2,
            symbolSize: 8
          },
          zlevel: index,
          lineStyle: {
            color: color[index],
            opacity: 0.5,
            width: 4
          }
        }
      }).filter((line, lineIndex) => lineId ? lineIndex === lineId - 1 : true).concat().value()
      // 交换站点
      series.push({
        name: 'change',
        type: 'effectScatter',
        coordinateSystem: 'bmap',
        data: cStations,
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
        zlevel: 10
      })
      // 普通站点
      series.push({
        name: 'normal',
        type: 'scatter',
        coordinateSystem: 'bmap',
        data: nStations,
        symbolSize: 10,
        label: {
          formatter: '{b}',
          position: 'bottom',
          show: !!lineId
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
        },
        zlevel: 10
      })

      this.myChart.setOption({
        bmap: {
          center: this.$store.state.map.center,
          zoom: this.$store.state.map.scale,
          roam: true,
          mapStyle: utils.mapstyle
        },
        series: series
      }, true)
    }
  },
  watch: {
    '$store.state.map.center' (newVal, oldVal) {
      this.myChart.setOption({
        bmap: {
          center: this.$store.state.map.center,
          zoom: this.$store.state.map.scale,
          roam: true,
          mapStyle: utils.mapstyle
        }
      })
    },
    '$store.state.map.lineId' (newVal, oldVal) {
      this.drawMap(newVal)
    }
  },
  mounted () {
    this.myChart = echarts.init(document.getElementById('main'))
    this.drawMap()
    this.resizeDB = _.debounce(this.myChart.resize, 100)

    ipcRenderer.on('resize', () => {
      if (this.myChart !== undefined) {
        this.resizeDB()
      }
    })
    this.myChart.on('click', params => {
      console.log(params)
    })
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
