<template>
  <div class="WAL position-relative bg-grey-4" :style="style">
    <q-layout view="hHr lpR fFr" class="WAL__layout shadow-3" container>
      <q-header elevated>

        <q-toolbar class="bg-grey-3 text-black">
          <q-btn
            round
            flat
            icon="keyboard_arrow_left"
            class="WAL__drawer-open q-mr-sm"
            @click="leftDrawerOpen = true"
          />

          <q-btn round dense flat icon="subway" color="grey-8" size="16px"/>

          <q-toolbar-title>武汉地铁</q-toolbar-title>

          <q-space/>

          <q-btn round flat icon="more_vert">
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
          <!--          <q-list>-->
          <!--            <q-item-->
          <!--              v-for="(conversation, index) in conversations"-->
          <!--              :key="conversation.id"-->
          <!--              clickable-->
          <!--              v-ripple-->
          <!--              @click="currentConversationIndex = index"-->
          <!--            >-->
          <!--              <q-item-section avatar>-->
          <!--                <q-avatar>-->
          <!--                  <img :src="conversation.avatar">-->
          <!--                </q-avatar>-->
          <!--              </q-item-section>-->

          <!--              <q-item-section>-->
          <!--                <q-item-label lines="1">-->
          <!--                  {{ conversation.person }}-->
          <!--                </q-item-label>-->
          <!--                <q-item-label class="conversation__summary" caption>-->
          <!--                  <q-icon name="check" v-if="conversation.sent"/>-->
          <!--                  <q-icon name="not_interested" v-if="conversation.deleted"/>-->
          <!--                  {{ conversation.caption }}-->
          <!--                </q-item-label>-->
          <!--              </q-item-section>-->

          <!--              <q-item-section side>-->
          <!--                <q-item-label caption>-->
          <!--                  {{ conversation.time }}-->
          <!--                </q-item-label>-->
          <!--                <q-icon name="keyboard_arrow_down"/>-->
          <!--              </q-item-section>-->
          <!--            </q-item>-->
          <!--          </q-list>-->
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
  name: 'WhatsappLayout',
  data () {
    return {
      rightDrawerOpen: false,
      search: '',
      message: '',
      currentConversationIndex: 0,
      conversations: [
        {
          id: 1,
          person: 'Razvan Stoenescu',
          avatar: 'https://cdn.quasar.dev/team/razvan_stoenescu.jpeg',
          caption: 'I\'m working on Quasar!',
          time: '15:00',
          sent: true
        },
        {
          id: 2,
          person: 'Dan Popescu',
          avatar: 'https://cdn.quasar.dev/team/dan_popescu.jpg',
          caption: 'I\'m working on Quasar!',
          time: '16:00',
          sent: true
        },
        {
          id: 3,
          person: 'Jeff Galbraith',
          avatar: 'https://cdn.quasar.dev/team/jeff_galbraith.jpg',
          caption: 'I\'m working on Quasar!',
          time: '18:00',
          sent: true
        },
        {
          id: 4,
          person: 'Allan Gaunt',
          avatar: 'https://cdn.quasar.dev/team/allan_gaunt.png',
          caption: 'I\'m working on Quasar!',
          time: '17:00',
          sent: true
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
  }
}
</script>

<style lang="sass">
.WAL
  width: 100%
  height: 100%
  padding-top: 20px
  padding-bottom: 20px

  &:before
    content: ''
    height: 127px
    position: fixed
    top: 0
    width: 100%
    background-color: #009688

  &__layout
    margin: 0 auto
    z-index: 4000
    height: 100%
    width: 90%
    max-width: 1050px
    border-radius: 5px

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
</style>
