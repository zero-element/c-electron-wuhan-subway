#include "library.h"
#include "math.h"
#include "stdio.h"

#define INF 0x3f3f3f3f
#define MAXN 500
#define MAXM 2000
#define MAXK 2
#define MAXL 10
#define DIRP 1
#define DIRN 2
#define TYPEDIS 1
#define TYPETIME 2
#define TYPEFACTOR 3

#define length(array, len) {len = (sizeof(array) / sizeof(array[0]));}

typedef struct {
    double time, dis;
    int fromSid, fromUid, toSid, toUid, next, type, direct, line;   //to表示点，next表示边
} Edge;

typedef struct {
    double cost[2]; // 最优及次优代价
    int from[2], isChange[2]; // 来源边id 是否换乘
} Cost;

typedef struct {
    int sid;
    double time;
    int direct;
} Node;

Edge edge[MAXM]; // 邻接链表
Cost costs[MAXN]; // 记录点的最短及次短路结果
Node q[MAXN]; // spfa队列

int n, cnt = 1, qFront, qEnd, beginUid;
int head[MAXN], vis[MAXN], inLineIndex[MAXN][2], idReflect[MAXN];
double fac[MAXL], limitFac = 1;

void addEdge(int fromSid, int fromUid, int toSid, int toUid, double time, double dis, int line) {
    edge[cnt].fromSid = fromSid;
    edge[cnt].fromUid = fromUid;
    edge[cnt].toSid = toSid;
    edge[cnt].toUid = toUid;
    edge[cnt].time = time;
    edge[cnt].dis = dis;
    edge[cnt].line = line;
    edge[cnt].direct = DIRP;
    edge[cnt].next = head[fromSid];
    head[fromSid] = cnt++;

    edge[cnt].fromSid = toSid;
    edge[cnt].fromUid = toUid;
    edge[cnt].toSid = fromSid;
    edge[cnt].toUid = fromUid;
    edge[cnt].time = time;
    edge[cnt].dis = dis;
    edge[cnt].line = line;
    edge[cnt].direct = DIRN;
    edge[cnt].next = head[toSid];
    head[toSid] = cnt++;
    if (line)
        edge[cnt - 2].type = edge[cnt - 1].type = 0; // 0为普通边
    else
        edge[cnt - 2].type = edge[cnt - 1].type = 1; // 1为换乘边
}

double getFactor(double time, int line) {
    if (fac[line])
        return fac[line];
    if (line == 1 || line == 3) {
        if (time >= 90 && time <= 180)
            return 0.8;
        else if (time >= 630 && time <= 750)
            return 0.75;
        else
            return 0.4;
    } else if (line == 8) {
        if (time >= 210 || time <= 540)
            return 0.65;
        else
            return 0.2;
    } else if (line == 6 || line == 7) {
        if (time >= 660 && time <= 840)
            return 0.65;
        else
            return 0.15;
    }
    return 0.5;
}

void GetArriveTime(int sid, double time, int cur, douTime *result) {
    for (int i = 0; i < 2; i++) {
        int count = ceil(time / 3);
        double baseTime = 0;
        if (cur)baseTime = inLineIndex[sid][i] * 3;
        if (count * 3 - baseTime <= 1020) {
            if (count >= inLineIndex[sid][i]) // 已经有车能够到站
                result->time[i] = count * 3;
            else { // 未曾有车到站
                result->time[i] = inLineIndex[sid][i] * 3;
            }
        } else {
            result->time[i] = -1;
        }
    }
}

double getCost(int type, double time, Edge *e, int beginUid, douTime *waitTime) {
    int failCount = 0;
    if (e->fromUid == beginUid && e->toUid == beginUid) // 始发站换乘不计开销
        return 1e-5;
    if (getFactor(time, e->line) > limitFac)return INF;
    GetArriveTime(e->toSid, time, 1, waitTime);
    for (int i = 0; i < 2; i++) {
        if (waitTime->time[i] == -1)
            waitTime->time[i] = INF, failCount++;
        else
            waitTime->time[i] = waitTime->time[i] - time;
    }
    if (failCount == 2)
        return INF;

    switch (type) {
        case TYPEDIS:
            return e->dis;
            break;
        case TYPETIME:
            return e->time;
            break;
        case TYPEFACTOR:
            return e->time * getFactor(time, e->line);
            break;
        default:
            return INF;
    }
}

void spfa(int currentSid, int type, double time, int beginUid) {
    for (int i = 0; i <= n; i++) //初始化
    {
        costs[i].cost[0] = costs[i].cost[1] = INF;
        vis[i] = 0;
    }
    qFront = qEnd = 0;

    vis[currentSid] = 1;
    costs[currentSid].cost[0] = costs[currentSid].cost[1] = 0;
    q[qEnd].sid = currentSid, q[qEnd].direct = DIRN | DIRP, q[qEnd++].time = time;

    while (qEnd - qFront) {
        int currentDirect = q[qFront].direct;
        currentSid = q[qFront].sid;
        time = q[qFront++].time;
        qFront %= MAXN;
        vis[currentSid] = 0;
        for (int currentLineId = head[currentSid]; currentLineId; currentLineId = edge[currentLineId].next) {
            douTime waitTime;
            double currentCost = getCost(type, time, &edge[currentLineId], beginUid, &waitTime);
            int toSid = edge[currentLineId].toSid;

            for (int fromCostIndex = 0; fromCostIndex < MAXK; fromCostIndex++) {
                int updateCostId = -1;
                double expectCost = costs[currentSid].cost[fromCostIndex] + currentCost;
                if (costs[toSid].cost[0] > expectCost && (edge[currentLineId].direct & currentDirect)) { // 若可以松弛
                    updateCostId = 0;
                } else if (!(costs[toSid].cost[0] == expectCost)
                           && costs[toSid].cost[1] > expectCost
                           && (edge[currentLineId].direct & currentDirect
                               && costs[toSid].from[0] != currentSid // 不是回头路
                           )) {
                    updateCostId = 1;
                }
                if (updateCostId != -1) {
                    costs[toSid].cost[updateCostId] = costs[currentSid].cost[fromCostIndex] + currentCost;
                    costs[toSid].from[updateCostId] = currentLineId;
                    if (!vis[toSid]) {
                        if (edge[currentLineId].type) // 如果是换乘，对两个方向进行松弛
                        {
                            for (int dirIndex = 0; dirIndex < 2; dirIndex++)
                                if (waitTime.time[dirIndex] < INF)
                                    q[qEnd].sid = toSid, q[qEnd].direct = (1 << dirIndex),
                                    q[qEnd++].time =
                                            time + edge[currentLineId].time + waitTime.time[dirIndex], qEnd %= MAXN;
                        } else // 普通站点则允许两个方向
                        {
                            q[qEnd].sid = toSid, q[qEnd].direct = DIRP | DIRN,
                                    q[qEnd++].time = time + edge[currentLineId].time, qEnd %= MAXN;
                        }
                        vis[toSid] = 1;
                    }
                }
            }
        }
    }
}

void SetFactor(int lineId, double newFactor, double limit) {
    limitFac = limit;
    fac[lineId] = newFactor;
}

void GetResult(int fromUid, int fromSid, int toUid, int type, double time, Result *r) {
    spfa(fromSid, type, time, fromUid);
    int lastSid[2], hasResult[2];
    r[0].cost = r[1].cost = INF;
    r[0].len = r[1].len = 0;
    hasResult[0] = hasResult[1] = 0;
    for (int stopIndex = 0; stopIndex <= 209; stopIndex++) {
        for (int resultIndex = 0; resultIndex < 2; resultIndex++) {
            if (idReflect[stopIndex] == toUid && r[resultIndex].cost > costs[stopIndex].cost[resultIndex]) {
                r[resultIndex].cost = costs[stopIndex].cost[resultIndex];
                hasResult[resultIndex] = 1;
                lastSid[resultIndex] = stopIndex;
            }
        }
    }
    for (int resultIndex = 0; resultIndex < 2; resultIndex++) {
        if (!hasResult[resultIndex])continue;
        int trueResultIndex = resultIndex;
        int flag = 0;
        int lastUid = toUid;
        while (lastUid != fromUid) {
            r[resultIndex].sids[r[resultIndex].len++] = lastSid[resultIndex];
            lastUid = edge[costs[lastSid[resultIndex]].from[trueResultIndex]].fromUid;
            lastSid[resultIndex] = edge[costs[lastSid[resultIndex]].from[trueResultIndex]].fromSid;
            if (flag == 1)trueResultIndex = 0;
            if (trueResultIndex && costs[lastSid[resultIndex]].from[0] != costs[lastSid[resultIndex]].from[1]) {
                flag = 1;
            }
        }
        r[resultIndex].sids[r[resultIndex].len++] = lastSid[resultIndex];
    }
}

void Init() {
    cnt = 1;
    FILE *fp = fopen("data.txt", "r");
    fscanf(fp, "%d", &n);
    for (int i = 0; i < n; i++) {
        int fuid, fsid, tuid, tsid, line;
        double time, dis;
        fscanf(fp, "%d %d %d %d %lf %lf %d", &fuid, &fsid, &tuid, &tsid, &time, &dis, &line);
        idReflect[fsid] = fuid, idReflect[tsid] = tuid;
        addEdge(fsid, fuid, tsid, tuid, time, dis, line);
    }
    fscanf(fp, "%d", &n);
    for (int i = 0; i < n; i++) {
        int sid;
        fscanf(fp, "%d", &sid);
        fscanf(fp, "%d %d", &inLineIndex[sid][0], &inLineIndex[sid][1]);
    }
    fclose(fp);
}
