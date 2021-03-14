<template>
  <div class="WAL position-relative bg-grey-4" :style="style">
    <q-layout view="hHh lpR fFr" class="WAL__layout shadow-3" container>
      <q-dialog
        v-model="needLogin"
        persistent
        maximized
        transition-show="slide-up"
        transition-hide="slide-down"
      >
        <q-card class="bg-grey-2 text-white">
          <q-bar>
            <q-space/>

            <q-btn dense flat icon="minimize" @click="minimize">
              <q-tooltip content-class="bg-black text-primary">Minimize</q-tooltip>
            </q-btn>
            <q-btn dense flat icon="crop_square" @click="maximize">
              <q-tooltip content-class="bg-black text-primary">Maximize</q-tooltip>
            </q-btn>
            <q-btn dense flat icon="close" @click="close">
              <q-tooltip content-class="bg-black text-primary">Close</q-tooltip>
            </q-btn>
          </q-bar>
          <div class="login-wrapper text-center">
            <q-card-section style="left: -150px; top: -150px;" class="shadow-2 bg-white q-py-lg">
              <form style="width:300px" class="q-gutter-lg">
                <div class="text-h5 text-grey-8">用户登录</div>
                <q-input
                  ref="username"
                  filled
                  v-model="username"
                  label="用户名"
                  v-touch-repeat.enter="login"
                />

                <q-input
                  ref="passwd"
                  filled
                  type="password"
                  v-model="passwd"
                  label="密码"
                  v-touch-repeat.enter="login"
                />

                <div>
                  <q-btn label="登录" @click="login" color="primary" style="margin-right: 16px"/>
                  <q-btn label="注册" @click="register" type="reset" color="secondary" flat class="q-ml-sm"/>
                </div>
              </form>
            </q-card-section>
          </div>

        </q-card>
      </q-dialog>

      <q-header elevated>
        <q-bar class="q-electron-drag text-black bg-grey-3 q-py-md">
          <q-icon name="subway"/>
          <div>武汉地铁</div>

          <q-space/>

          <q-btn dense flat icon="minimize" @click="minimize"/>
          <q-btn dense flat icon="crop_square" @click="maximize"/>
          <q-btn dense flat icon="close" @click="close"/>
        </q-bar>
      </q-header>

      <q-drawer side="right" show-if-above bordered :breakpoint="690">
        <q-toolbar class="bg-grey-3">
          <q-btn-toggle
            v-model="type"
            class="shadow-1"
            no-caps
            rounded
            unelevated
            toggle-color="primary"
            color="white"
            text-color="primary"
            :options="[
              {label: '价', value: 1},
              {label: '时', value: 2},
              {label: '拥', value: 3}
            ]"
            @click="doSearch"
          />
          <q-space/>

          <q-btn
            :icon="searchStatus?'check':'clear'"
            style="margin-right: .5em"
            dense
            round
            :color="searchStatus?'secondary':'red'"
            @click="doSearch"
          />

          <div>
            <q-badge color="teal" class="q-pa-xs" floating transparent>
              {{ time }}
            </q-badge>
            <q-btn
              icon="access_time"
              style="margin-right: .5em"
              dense
              round
              color="primary"
            >
              <q-popup-proxy
                @before-show="updateProxy"
                transition-show="scale"
                transition-hide="scale"
              >
                <q-time v-model="proxyTime" format24h>
                  <div class="row items-center justify-end q-gutter-sm">
                    <q-btn label="Cancel" color="primary" flat v-close-popup/>
                    <q-btn
                      label="OK"
                      color="primary"
                      flat
                      @click="saveProxy"
                      v-close-popup
                    />
                  </div>
                </q-time>
              </q-popup-proxy>
            </q-btn>
          </div>
        </q-toolbar>

        <div class="bg-grey-2 q-px-sm">
          <q-select
            dense
            borderless
            v-model="initStationName"
            use-input
            input-debounce="0"
            :placeholder="initPlaceHolder"
            :options="options"
            @filter="filterFn"
            @input="searchStation"
            @focus="initFocus"
            v-touch-repeat.enter="doSearch"
            style="width: 250px"
            class="WAL__field full-width"
          >
            <template v-slot:prepend>
              <q-icon
                name="fiber_manual_record"
                color="green"
                class="text-caption"
              />
            </template>

            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey">
                  No results
                </q-item-section>
              </q-item>
            </template>
          </q-select>

          <q-separator/>

          <q-select
            dense
            borderless
            v-model="finalStationName"
            use-input
            input-debounce="0"
            :placeholder="finalPlaceHolder"
            :options="options"
            @filter="filterFn"
            @input="searchStation"
            @focus="finalFocus"
            v-touch-repeat.enter="doSearch"
            style="width: 250px"
            class="WAL__field full-width"
          >
            <template v-slot:prepend>
              <q-icon
                name="fiber_manual_record"
                color="red"
                class="text-caption"
              />
            </template>

            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey">
                  No results
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>

        <!--   list    -->
        <q-scroll-area style="height: calc(100% - 100px)">
          <q-list v-if="!showResult">
            <q-expansion-item
              icon="mail"
              label="Inbox"
              header-class="q-my-sm q-mx-md shadow-2 text-white"
              :header-style="{ background: line.color, borderRadius: '5px' }"
              v-for="(line, lineIndex) in lines"
              :key="line.id"
              ref="item"
              clickable
              group="station"
              @hide="hideItem"
              @show="showItem(line.id)"
            >
              <template v-slot:header>
                <q-item-section>
                  <div class="text-h6">{{ line.name }}</div>
                  <div class="text-subtitle2">{{ line.detail }}</div>
                </q-item-section>
              </template>

              <q-card class="q-mx-md">
                <q-timeline :color="'line' + line.id" class="text-black">
                  <q-timeline-entry
                    v-for="currentStation in stations[lineIndex]"
                    class="cursor-pointer"
                    :key="currentStation.inStationIndex"
                  >
                    <template v-slot:title>
                      <div class="cursor-pointer" @click="
                      focusStation(currentLineId, currentStation.inStationIndex)
                    ">
                        {{ currentStation.name }}
                      </div>
                    </template>
                    <div v-if="currentStation.isChange" class="cursor-pointer row q-gutter-xs">
                      <q-badge :color="'line' + lineId" v-for="lineId in stationLines(currentStation.name)"
                               :key="lineId" class="q-pa-xs" transparent
                               @click="changeLine(currentLineId, currentStation.inStationIndex, lineId)">
                        {{ lineId + '号线' }}
                      </q-badge>
                    </div>
                  </q-timeline-entry>
                </q-timeline>
              </q-card>
            </q-expansion-item>
          </q-list>
          <q-list v-if="showResult">
            <q-expansion-item
              icon="mail"
              label="Inbox"
              header-class="q-my-sm q-mx-md shadow-2 text-white"
              :key="resultIndex"
              :header-style="{ background: lines[resultIndex].color, borderRadius: '5px' }"
              v-for="(result, resultIndex) in searchResult"
              group="result"
            >
              <template v-slot:header>
                <q-item-section>
                  <div class="text-h6">{{ '线路' + (resultIndex + 1) }}</div>
                  <div class="text-subtitle2">
                    {{ type === 1 ? '路程: ' + result.cost.toFixed(2) + ' 公里' : '时间: ' + result.cost.toFixed() + ' 分钟' }}
                  </div>
                </q-item-section>
              </template>

              <q-card class="q-mx-md">
                <q-timeline :color="'line' + (resultIndex+1)" class="text-black">
                  <div class="text-h6 text-grey-6">
                    {{
                      type === 1 ? '票价: ' + getPrice(result.cost).toFixed(2) + '元' : type === 3 ? '加权拥挤度: ' + Math.round(result.cost / 3 / result.stations.length * 100) + '%' : ''
                    }}
                  </div>
                  <q-timeline-entry
                    v-for="(currentStation,stationIndex) in result.stations"
                    class="cursor-pointer"
                    :key="stationIndex"
                  >
                    <template v-slot:title>
                      <div class="cursor-pointer">
                        {{ currentStation.name }}
                      </div>
                    </template>
                    <div v-if="currentStation.isChange" class="cursor-pointer row q-gutter-xs">
                      <q-badge :color="'line' + currentStation.changeLine"
                               class="q-pa-xs" transparent>
                        {{ lines[currentStation.changeLine - 1].name }}
                      </q-badge>
                    </div>
                  </q-timeline-entry>
                </q-timeline>
              </q-card>
            </q-expansion-item>
          </q-list>
        </q-scroll-area>
      </q-drawer>

      <q-page-container class="bg-grey-2 map">
        <router-view/>
      </q-page-container>
    </q-layout>
  </div>
</template>

<script>
import { GetLineStations, GetAllStations, GetRawStations, GetPrice } from 'src/libs/utils'
import * as _ from 'lodash'
import { GetResult, Init } from 'src/libs/dll'

const LINENUMBER = 7

export default {
  name: 'subwayLayout',
  data () {
    return {
      username: '',
      passwd: '',
      needLogin: true,
      type: 1,
      options: [],
      selectTime: false,
      time: '9:00',
      proxyTime: '9:00',
      currentLineId: 0,
      stationOptions: [],
      allStations: [],
      searchStatus: 1,
      lines: [
        {
          id: 1,
          name: '地铁1号线',
          detail: '径河-汉口北',
          color: '#3d84c6'
        },
        {
          id: 2,
          name: '地铁2号线',
          detail: '佛祖岭-天河机场',
          color: '#eb7caf'
        },
        {
          id: 3,
          name: '地铁3号线',
          detail: '宏图大道-沌阳大道',
          color: '#d9b966'
        },
        {
          id: 4,
          name: '地铁4号线',
          detail: '柏林-武汉火车站',
          color: '#8ec720'
        },
        {
          id: 5,
          name: '地铁6号线',
          detail: '东风公司-金银湖公园',
          color: '#008536'
        },
        {
          id: 6,
          name: '地铁7号线',
          detail: '园博园北-青龙山地铁小镇',
          color: '#eb7900'
        },
        {
          id: 7,
          name: '地铁8号线',
          detail: '军运村-金潭路',
          color: '#98acab'
        }
      ],
      stations: [],
      stationLines: this.getSationLines
    }
  },
  computed: {
    style () {
      return {
        height: this.$q.screen.height + 'px'
      }
    },
    showResult () {
      return this.$store.state.map.showResult
    },
    searchResult () {
      return this.$store.state.map.result
    },
    initPlaceHolder () {
      return this.$store.state.search.initStationName === null
        ? '起始站点'
        : ''
    },
    finalPlaceHolder () {
      return this.$store.state.search.finalStationName === null
        ? '目的站点'
        : ''
    },
    initStationName: {
      get () {
        return this.$store.state.search.initStationName
      },
      set (value) {
        this.$store.commit('search/updateStationName', value)
      }
    },
    finalStationName: {
      get () {
        return this.$store.state.search.finalStationName
      },
      set (value) {
        this.$store.commit('search/updateStationName', value)
      }
    }
  },
  methods: {
    minimize () {
      if (process.env.MODE === 'electron') {
        this.$q.electron.remote.BrowserWindow.getFocusedWindow().minimize()
      }
    },
    maximize () {
      if (process.env.MODE === 'electron') {
        const win = this.$q.electron.remote.BrowserWindow.getFocusedWindow()

        if (win.isMaximized()) {
          win.unmaximize()
        } else {
          win.maximize()
        }
      }
    },
    close () {
      if (process.env.MODE === 'electron') {
        this.$q.electron.remote.BrowserWindow.getFocusedWindow().close()
      }
    },
    login () {
      this.$store.dispatch('user/login', {
        username: this.username,
        passwd: this.passwd
      }).then(() => {
        this.$q.notify({
          type: 'positive',
          message: '登陆成功'
        })
        this.needLogin = false
      }).catch((err) => {
        this.$q.notify({
          type: 'negative',
          message: err
        })
      })
    },
    register () {
      this.$store.dispatch('user/register', {
        username: this.username,
        passwd: this.passwd
      }).then(() => {
        this.$q.notify({
          type: 'positive',
          message: '注册成功'
        })
      }).catch((err) => {
        this.$q.notify({
          type: 'negative',
          message: err
        })
      })
    },
    focusStation (lineId, stationIndex) {
      const focusedStation = this.stations[lineId - 1][stationIndex]
      const centerStation = _(this.allStations).find({
        name: focusedStation.name
      })
      if (this.$store.state.search.focusInput === 1) {
        this.initStationName = focusedStation.name
      } else {
        this.finalStationName = focusedStation.name
      }
      this.$store.commit('map/updateFocusCenter', centerStation.value)
    },
    changeLine (fromLineId, stationIndex, toLineId) {
      const focusedStation = this.stations[fromLineId - 1][stationIndex]
      const centerStation = _(this.stations[toLineId - 1]).find({
        name: focusedStation.name
      })
      if (toLineId !== fromLineId) {
        if (fromLineId) {
          this.$refs.item[fromLineId - 1].hide()
        }
        this.$refs.item[toLineId - 1].show()
      }
      this.$store.commit('map/updateFocusCenter', centerStation.value)
      this.$store.commit('search/updateStationName', focusedStation.name)
    },
    hideItem (evt) {
      if (evt) {
        this.$store.commit('map/updateFocusLine', 0)
      }
    },
    showItem (lineId) {
      this.currentLineId = lineId
      this.$store.commit('map/updateFocusLine', lineId)
    },
    filterFn (val, update, abort) {
      if (val.length < 1) {
        const tips = this.$store.getters['user/getHistory']
        if (tips.length) {
          update(() => {
            this.options = tips
          })
        } else {
          abort()
        }
        return
      }

      update(() => {
        this.options = this.stationOptions.filter(v => v.indexOf(val) > -1)
      })
    },
    searchStation (val) {
      const resultStation = _(this.allStations).find({ name: val })
      if (!resultStation) return
      if (resultStation.lineId.length === 1) {
        // 非换乘站
        this.$refs.item[resultStation.lineId - 1].show()
      } else {
        // 换乘站
        if (this.currentLineId) {
          this.$refs.item[this.currentLineId - 1].hide()
        }
        this.$store.commit('map/updateFocusLine', 0)
      }
      this.$store.commit('map/updateFocusCenter', resultStation.value)
    },
    initFocus () {
      this.$store.commit('search/updateFocusId', 1)
    },
    finalFocus () {
      this.$store.commit('search/updateFocusId', 2)
    },
    updateProxy () {
      this.proxyTime = this.time
    },
    saveProxy () {
      this.time = this.proxyTime
    },
    getSationLines (name) {
      const allStations = GetAllStations()
      const resultStation = _(allStations).find({ name: name })
      return resultStation.lineId
    },
    doSearch () {
      if (this.searchStatus) {
        const initName = this.$store.state.search.initStationName
        const finalName = this.$store.state.search.finalStationName
        this.$store.commit('user/addHistory', initName)
        this.$store.commit('user/addHistory', finalName)
        const timeInt = this.$store.state.search.numberTime
        const allStations = GetRawStations()
        const fromStation = _(allStations).find({ name: initName })
        const toStation = _(allStations).find({ name: finalName })
        const res = GetResult(fromStation.uid, fromStation.sid, toStation.uid, this.type, timeInt)
        if (res[0].len === 0) {
          this.$q.notify({
            type: 'negative',
            message: '无合理路线'
          })
          return
        }
        const results = []
        for (let i = 0; i < 2; i++) {
          const set = {}
          const lineStations = []
          let changeFlag = true
          _(res[i].sids).take(res[i].len).reverse().reduce((last, sid) => {
            const currentStation = _(allStations).find({ sid: sid })
            if (set[currentStation.sid]) {
              changeFlag = false
            }
            set[currentStation.sid] = 1
            if (last === currentStation.uid) {
              lineStations[lineStations.length - 1].isChange = true
              lineStations[lineStations.length - 1].changeLine = currentStation.line_id
            } else {
              currentStation.value = currentStation.position
              currentStation.isChange = false
              lineStations.push(currentStation)
            }
            return currentStation.uid
          }, -1)
          if (!changeFlag || res[i].cost > 10000) continue // 出现回头或cost无穷
          results.push({
            cost: res[i].cost,
            stations: _(lineStations).value()
          })
        }
        this.$store.commit('map/updateResult', results)
        this.searchStatus = 0
      } else {
        this.searchStatus = 1
        this.initStationName = ''
        this.finalStationName = ''
        this.$store.commit('map/updateFocusLine', 0)
      }
    },
    getPrice (distance) {
      return GetPrice(distance)
    }
  },
  watch: {
    time (newVal) {
      this.$store.commit('search/updateTime', newVal)
    }
  },
  created () {
    for (let i = 0; i < LINENUMBER; i++) {
      this.stations.push(GetLineStations(i + 1))
    }
  },
  mounted () {
    this.allStations = GetAllStations()
    this.stationOptions.push(...this.allStations.map(station => station.name))
    Init()
  }
}
</script>

<style lang="sass">
.login-wrapper
  position: fixed
  left: 50%
  top: 50%

.WAL
  width: 100%
  height: 100%

  &__field.q-field--outlined .q-field__control:before
    border: none

@media (max-width: 850px)
  .WAL
    padding: 0

    &__layout
      width: 100%
      border-radius: 0

@media (min-width: 691px)
  .WAL
    &__drawer-open
      display: none

.station-card
  width: 100%
  margin: 0 auto

.text-line
  &1
    color: #3d84c6

  &2
    color: #eb7caf

  &3
    color: #d9b966

  &4
    color: #8ec720

  &5
    color: #008536

  &6
    color: #eb7900

  &7
    color: #98acab

.bg-line
  &1
    background: #3d84c6

  &2
    background: #eb7caf

  &3
    background: #d9b966

  &4
    background: #8ec720

  &5
    background: #008536

  &6
    background: #eb7900

  &7
    background: #98acab
</style>
