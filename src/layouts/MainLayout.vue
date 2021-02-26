<template>
  <div class="WAL position-relative bg-grey-4" :style="style">
    <q-layout view="hHh lpR fFr" class="WAL__layout shadow-3" container>
      <q-header elevated>

        <q-bar class="q-electron-drag text-black bg-grey-3">
          <q-icon name="subway"/>
          <div>武汉地铁</div>

          <q-space/>

          <q-btn dense flat icon="minimize" @click="minimize"/>
          <q-btn dense flat icon="crop_square" @click="maximize"/>
          <q-btn dense flat icon="close" @click="closeApp"/>
        </q-bar>

        <q-toolbar class="bg-grey-3 text-black">

          <q-btn dense round flat icon="more_vert">
            <q-menu auto-close :offset="[110, 0]">
              <q-list style="min-width: 150px">
                <q-item clickable>
                  <q-item-section>Contact data</q-item-section>
                </q-item>
                <q-item clickable>
                  <q-item-section>Block</q-item-section>
                </q-item>
                <q-item clickable>
                  <q-item-section>Select messages</q-item-section>
                </q-item>
                <q-item clickable>
                  <q-item-section>Silence</q-item-section>
                </q-item>
                <q-item clickable>
                  <q-item-section>Clear messages</q-item-section>
                </q-item>
                <q-item clickable>
                  <q-item-section>Erase messages</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </q-toolbar>
      </q-header>

      <q-drawer
        v-model="rightDrawerOpen"
        side="right"
        show-if-above
        bordered
        :breakpoint="690"
      >
        <q-toolbar class="bg-grey-3">
          <q-toolbar-title>路线信息</q-toolbar-title>
          <q-space/>

          <q-btn
            round
            flat
            icon="close"
            class="WAL__drawer-close"
            @click="leftDrawerOpen = false"
          />
        </q-toolbar>

        <q-toolbar class="bg-grey-2">
          <q-input rounded outlined dense class="WAL__field full-width" bg-color="white" v-model="search"
                   placeholder="搜索你需要寻找的站点">
            <template slot="prepend">
              <q-icon name="search"/>
            </template>
          </q-input>
        </q-toolbar>

        <!--   list    -->
        <q-scroll-area style="height: calc(100% - 100px)">
          <q-list>
            <q-expansion-item icon="mail" label="Inbox" caption="5 unread emails"
                              header-class="q-my-sm q-mx-md shadow-2 text-white"
                              :header-style="{ background: station.color, borderRadius: '5px' }"
                              v-for="station in stations"
                              :key="station.id"
                              clickable
                              group="station"
                              @click="showLine(station.id)"
            >
              <template v-slot:header>
                <q-item-section>
                  <div class="text-h6">{{ station.name }}</div>
                  <div class="text-subtitle2">{{ station.detail }}</div>
                </q-item-section>
              </template>

              <q-card class="q-mx-md">
                {{ station.detail }}
              </q-card>
            </q-expansion-item>
          </q-list>
        </q-scroll-area>
      </q-drawer>

      <q-page-container class="bg-grey-2">
        <router-view/>
      </q-page-container>

    </q-layout>
  </div>
</template>

<script>
export default {
  name: 'SubwayLayout',
  data () {
    return {
      rightDrawerOpen: false,
      search: '',
      message: '',
      currentConversationIndex: 0,
      stations: [
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
      ]
    }
  },
  computed: {
    currentConversation () {
      return this.conversations[this.currentConversationIndex]
    },
    style () {
      return {
        height: this.$q.screen.height + 'px'
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
        console.error(win.isMaximizable())
        if (win.isMaximized()) {
          win.unmaximize()
        } else {
          win.maximize()
        }
      }
    },
    closeApp () {
      if (process.env.MODE === 'electron') {
        this.$q.electron.remote.BrowserWindow.getFocusedWindow().close()
      }
    },
    showLine (lineId) {
      const centerStationId = [
        [114.32, 30.63],
        [114.4, 30.63],
        [114.28, 30.595],
        [114.30, 30.575],
        [114.28, 30.585],
        [114.35, 30.51],
        [114.37, 30.56]]
      if (this.$store.state.map.lineId === lineId) {
        this.$store.commit('map/updateCenter', null)
        this.$store.commit('map/updateFocusLine', 0)
        return
      }
      this.$store.commit('map/updateCenter', centerStationId[lineId - 1])
      this.$store.commit('map/updateFocusLine', lineId)
    }
  }
}
</script>

<style lang="sass">
.WAL
  width: 100%
  height: 100%

  &__field.q-field--outlined .q-field__control:before
    border: none

  .q-drawer--standard
    .WAL__drawer-close
      display: none

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

.conversation__summary
  margin-top: 4px

.conversation__more
  margin-top: 0 !important
  font-size: 1.4rem

.station-card
  width: 100%
  margin: 0 auto
</style>
