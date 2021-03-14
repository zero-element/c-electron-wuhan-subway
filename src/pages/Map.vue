<template>
  <div class="echarts-map">
    <div id="main" style="height:100%; width: 100%"></div>
    <q-dialog v-model="showPop" persistent>
      <q-card>
        <q-card-section>
          <div class="text-h6">修改拥挤度</div>
        </q-card-section>

        <q-card-section class="row items-center">

          <q-badge color="primary">
            设置该线路拥挤度为: {{ curFactor }} %
          </q-badge>
          <q-slider v-model="curFactor" :min="0" :max="100"/>

          <q-badge color="secondary">
            设置最大允许拥挤度为: {{ limitFactor }} %
          </q-badge>
          <q-slider v-model="limitFactor" :min="0" :max="100" color="green"/>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="取消" color="red" v-close-popup/>
          <q-btn flat label="确定" @click="updateFactor" color="primary" v-close-popup/>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import 'echarts/extension/bmap/bmap'
import * as echarts from 'echarts'
import * as utils from 'src/libs/utils'
import * as _ from 'lodash'
import { ipcRenderer } from 'electron'
import { GetArriveTime, SetFactor } from 'src/libs/dll'

export default {
  name: 'Echarts',
  data () {
    return {
      myChart: null,
      resizeDB: null,
      showPop: false,
      curFactor: 0,
      curLineId: 0,
      limitFactor: 100
    }
  },
  methods: {
    mountMap (params) {
      if (params.name && params.componentSubType !== 'lines' && !this.$store.state.map.showResult) {
        const rawStations = utils.GetRawStations().value()
        const stationIndex = _(rawStations).findIndex({ name: params.name })
        this.$store.commit('search/updateStationName', params.name)
        const timeResult = GetArriveTime(rawStations[stationIndex].sid, this.$store.state.search.numberTime)
        let msg = ''
        let flag = 0
        if (stationIndex && timeResult.time[1] !== -1 && rawStations[stationIndex - 1].line_id === rawStations[stationIndex].line_id) {
          msg += '<p>向 ' + rawStations[stationIndex - 1].name + ' 方向列车将于 ' + utils.GetSTime(timeResult.time[1]) + ' 到达</p>'
          flag = 1
        }
        if (stationIndex < 209 && timeResult.time[0] !== -1 && rawStations[stationIndex + 1].line_id === rawStations[stationIndex].line_id) {
          msg += '<p>向 ' + rawStations[stationIndex + 1].name + ' 方向列车将于 ' + utils.GetSTime(timeResult.time[0]) + ' 到达</p>'
          flag = 1
        }
        this.$q.notify({
          type: flag ? 'positive' : 'negative',
          message: flag ? msg : '<p>该站点已停运</p>',
          html: true
        })
      } else if (params.componentSubType === 'lines' && !this.$store.state.map.showResult) {
        this.curLineId = params.seriesIndex + 1
        this.showPop = true
      }
    },
    refresh () {
      this.myChart.dispose()
      this.myChart = echarts.init(document.getElementById('main'))
      this.myChart.on('click', params => this.mountMap(params))
    },
    updateFactor () {
      SetFactor(this.curLineId, this.curFactor / 100, this.limitFactor / 100)
    },
    drawMap (lineId) {
      const color = ['#3d84c6', '#eb7caf', '#d9b966', '#8ec720', '#008536', '#eb7900', '#98acab', '#f2cf01']
      const lines = utils.GetLines()
      const {
        nStations,
        cStations
      } = utils.GetStationCollection(lineId)

      // map数据
      let series = []
      series = _(lines).map((line, index) => {
        return {
          type: 'lines',
          coordinateSystem: 'bmap',
          data: [line],
          polyline: true,
          // effect: {
          //   constantSpeed: 20,
          //   show: true,
          //   trailLength: 0.2,
          //   symbolSize: 8
          // },
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
    },
    drawResult (results) {
      this.refresh()
      const color = ['#3d84c6', '#eb7caf', '#d9b966', '#8ec720', '#008536', '#eb7900', '#98acab', '#f2cf01']

      const series = []
      for (let index = 0; index < results.length; index++) {
        const result = results[index]
        const normalStations = _(result.stations).filter(station => station.isChange === false).value()
        const changeStations = _(result.stations).filter(station => station.isChange === true).value()

        const line = {
          coords: _(result.stations).map(stop => {
            return stop.value
          }).value()
        }
        series.push(
          {
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
        )
        // 交换站点
        series.push({
          name: 'change',
          type: 'effectScatter',
          coordinateSystem: 'bmap',
          data: changeStations,
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
          data: normalStations,
          symbolSize: 10,
          label: {
            formatter: '{b}',
            position: 'bottom',
            show: true
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
      }

      this.myChart.setOption({
        bmap: {
          center: [114.25, 30.575],
          zoom: 12,
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
    '$store.state.map.lineId' (newVal) {
      this.drawMap(newVal)
    },
    '$store.state.map.showResult' (newVal) {
      if (newVal) {
        this.drawResult(this.$store.state.map.result)
      } else {
        this.drawMap(0)
      }
    }
  },
  mounted () {
    this.myChart = echarts.init(document.getElementById('main'))
    this.drawMap()
    this.resizeDB = _.debounce(this.myChart.resize, 50)

    ipcRenderer.on('resize', () => {
      if (this.myChart !== undefined) {
        this.resizeDB()
      }
    })
    window.onresize = () => {
      this.resizeDB()
    }
    this.myChart.on('click', params => this.mountMap(params))
  }
}
</script>

<style lang="sass">
.echarts-map
  position: fixed
  width: calc(100% - 300px)
  top: 0px
  bottom: 0px

@media (max-width: 691px)
  .echarts-map
    width: 100%
</style>
