import { Circle } from "./Circle";
import { EnemyData } from "./Mission";
import HorizontalScene from "./HorizontalScene";
import { Enemy } from "./Enemy";

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
export class Boss extends cc.Component {

    result: number = 0;
    phaseIndex: number = 0;
    circles: Circle[] = [];
    createIntervalMin: number = 0;
    createIntervalMax: number = 0;
    childIdMin: number = 0;
    childIdMax: number = 0;
    firstCreateDelay: number = 0;
    data: EnemyData = null;
    phaseCircleCount: number[] = [];
    isDead: boolean = false;
    createInterval: number = 0;
    timeEscape: number = 0;
    createEnemy: Function = null;

    init(data: EnemyData) {
        this.timeEscape = 0;
        this.isDead = false;
        this.data = data;
        this.result = 0;
        this.phaseIndex = 0;
        this.circles = this.node.getComponentsInChildren(Circle);
        this.circles.reverse();
        this.phaseCircleCount = data.circleCount;
        this.createInterval = data.firstChildDelay;
        this.childIdMin = data.childIdMin;
        this.childIdMax = data.childIdMax;
    }

    initChildren() {
        this.result = 0;
        for (let i = 0; i < this.circles.length; i++) {
            if (i < this.phaseCircleCount[this.phaseIndex]) {
                this.circles[i].node.active = true;
                this.circles[i].number = HorizontalScene.randomNumber(this.data.num_min, this.data.num_max);
                this.circles[i].label.string = String(this.circles[i].number);
                this.result += this.circles[i].number;
            } else {
                this.circles[i].node.active = false;
            }
        }

    }

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    // start() {

    // }

    update(dt) {
        if (this.isDead) {
            return;
        }
        this.timeEscape += dt;
        if (this.timeEscape > this.createInterval) {
            this.timeEscape = 0;
            this.createInterval = HorizontalScene.randomNumber(this.data.createChildIntervalMin, this.data.createChildIntervalMax);

            let _scene: HorizontalScene = this.node.parent.getComponent(HorizontalScene);
            if (_scene) {
                let _enemy = this.generalEnemy();
                if (_enemy) {
                    _enemy.node.setPosition(-150, 300);
                }
                _scene.m_ActiveList.push(_enemy);
            }
        }
    }

    hit() {
        if (this.phaseIndex + 1 < this.phaseCircleCount.length) {
            this.phaseIndex += 1;
            this.initChildren();
        } else {
            this.isDead = true;
        }
    }

    generalEnemy(): Enemy {

        let _scene: HorizontalScene = this.node.parent.getComponent(HorizontalScene);
        if (!_scene) {
            return null;
        }

        let id = HorizontalScene.randomNumber(this.childIdMin, this.childIdMax) * 100;

        if (!_scene.m_PrefabDict[id]) {
            return null;
        }

        let _enemy: Enemy = null;

        if (typeof _scene.m_FreePool[id] === "undefined") {
            _scene.m_FreePool[id] = [];
        }
        if (_scene.m_FreePool[id].length > 0) {
            _enemy = _scene.m_FreePool[id].pop();
        } else {
            let _newNode = cc.instantiate(_scene.m_PrefabDict[id]);
            _enemy = _newNode.getComponent(Enemy);
        }
        _enemy.node.active = true;
        _enemy.node.parent = _scene.node;

        let _enemyData: EnemyData = new EnemyData();
        _enemyData.num_min = 1;
        _enemyData.num_max = 9;
        _enemyData.speed = 1;
        _enemyData.animationSpeed = 1;

        _enemy.init(_enemyData);

        return _enemy;
    }
}
