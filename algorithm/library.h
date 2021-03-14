#ifndef C_SUBWAY_ALGORITHM_LIBRARY_H
#define C_SUBWAY_ALGORITHM_LIBRARY_H

typedef struct {
    int len;
    double cost;
    int sids[50];
} Result;
typedef struct {
    double time[2];
} douTime;

_declspec(dllexport) void Init();
_declspec(dllexport) void GetResult(int fromUid, int fromSid, int toUid, int type, double time, Result *r);
_declspec(dllexport) void SetFactor(int lineId, double newFactor, double limit);
_declspec(dllexport) void GetArriveTime(int sid, double time, int cur, douTime *result);

#endif //C_SUBWAY_ALGORITHM_LIBRARY_H