#include<stdio.h>
#include<string.h>

#define INF 0x3f3f3f3f
#define MAXN 500
#define MAXM 2000
#define length(array,len) {len = (sizeof(array) / sizeof(array[0]));}

struct Edge {
    int to, toUid, next, line;   //to表示点，next表示边
    double time, dis;
} edge[MAXM];
struct result {
    double firCost, secCost;
    int firFrom, secFrom;
} result[MAXN];

int n, cnt = 1, qFront, qEnd, beginUid;
int head[MAXN], vis[MAXN], q[MAXN];

double getFactor(double time, int line) {}

double getCost(int type, double time, struct Edge *e) {}

void addEdge(int from, int fromUid, int to, int toUid, double time, double dis, int line) {
    edge[cnt].to = to;
    edge[cnt].toUid = toUid;
    edge[cnt].time = time;
    edge[cnt].dis = dis;
    edge[cnt].line = line;
    edge[cnt].next = head[from];
    head[from] = cnt++;

    edge[cnt].to = from;
    edge[cnt].toUid = fromUid;
    edge[cnt].time = time;
    edge[cnt].dis = dis;
    edge[cnt].line = line;
    edge[cnt].next = head[to];
    head[to] = cnt++;
}

void spfa(int u, int type, double time) {
    for (int i = 0; i <= n; i++) //初始化
    {
        result[i].firCost = result[i].secCost = INF;
        vis[i] = 0;
    }
    qFront = qEnd = 0;

    vis[u] = 1;
    q[qEnd++] = u;

    while (qEnd - qFront) {
        u = q[qFront++];
        qFront %= MAXN;
        vis[u] = 0;
        for(int i=head[u];i;i=edge[i].next){
            if(dis[e[i].to]>dis[k]+e[i].w){//若可以松弛
                dis[e[i].to]=dis[k]+e[i].w;//更新距离
                if(!b[e[i].to]){
                    q[qEnd++] = edge[i].to;
                    qEnd%=MAXN;
                    vis[edge[i].to] = 1;
                }
            }
        }
    }
}

int main() {
    FILE *fp = fopen("data.txt", "r");
    fscanf(fp, "%d", &n);
    for (int i = 0; i < n; i++) {
        int fuid, fsid, tuid, tsid, line;
        double time, dis;
        fscanf(fp, "%d %d %d %d %f %f %d", &fuid, &fsid, &tuid, &tsid, &time, &dis, &line);
        addEdge(fsid, fuid, tsid, tuid, time, dis, line);
    }
    fclose(fp);
}