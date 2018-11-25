// Learn TypeScript:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export class Mission {
    enemys: EnemyData[] = [];
}

@ccclass
export class EnemyData {
    isBoss: boolean = false;
    id: number = 0;
    speed: number = 0;
    num_min: number = 0;
    num_max: number = 0;
    animationSpeed: number = 0;
    circleCount: number[] = [];
    firstChildDelay: number = 0;
    createChildIntervalMin: number = 0;
    createChildIntervalMax: number = 0;
    childIdMin: number = 0;
    childIdMax: number = 0;
}