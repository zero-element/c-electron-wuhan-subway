const ffi = require('ffi-napi')
const ref = require('ref-napi')
const refArray = require('ref-array-napi')
const Struct = require('ref-struct-napi')

const Result = Struct({
  len: ref.types.int,
  cost: ref.types.double,
  sids: refArray(ref.types.int, 50)
})
const ResultArray = refArray(Result)
const douTime = Struct({
  time: refArray(ref.types.double, 2)
})

export const dll = ffi.Library('algorithm', {
  Init: ['void', []],
  SetFactor: ['void', ['int', 'double', 'double']],
  GetResult: ['void', ['int', 'int', 'int', 'int', 'double', ResultArray]],
  GetArriveTime: ['void', ['int', 'double', 'int', ref.refType(douTime)]]
})

export function Init () {
  dll.Init()
}

export function GetResult (fromUid, fromSid, toUid, type, time) {
  const res = new ResultArray(2)
  dll.GetResult(fromUid, fromSid, toUid, type, time, res)
  return res
}

export function SetFactor (lineId, newFactor, limit) {
  dll.SetFactor(lineId, newFactor, limit)
}

export function GetArriveTime (sid, time) {
  const dTimePointer = ref.alloc(douTime)
  dll.GetArriveTime(sid, time, 1, dTimePointer)
  return dTimePointer.deref()
}
