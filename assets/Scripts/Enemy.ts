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

import { Circle } from "./Circle";
import HorizontalScene from "./HorizontalScene";
import { EnemyData } from "./Mission";

@ccclass
export class Enemy extends cc.Component {

    result: number = 0;
    data: EnemyData = null;
    isDead: boolean = false;
    speed: number = 0;

    init(data: EnemyData) {

        this.isDead = false;
        this.data = data;
        this.result = 0;

        for (let i = 0; i < this.node.children.length; i++) {
            let _circle = this.node.children[i].getComponent(Circle);
            if (_circle) {
                _circle.number = HorizontalScene.randomNumber(data.num_min, data.num_max);
                _circle.label.string = String(_circle.number);
                this.result += _circle.number;
            }
        }

        let _animations = this.node.getComponentsInChildren(cc.Animation);
        for (let i = 0; i < _animations.length; i++) {
            let _animState = _animations[i].play();
            _animState.speed = data.animationSpeed;
        }

        this.speed = data.speed;

    }

    // LIFE-CYCLE CALLBACKS:

    // onLoad() {
    // }

    // start() {

    // }

    update(dt) {
        if (this.isDead) {
            return;
        }
        this.node.setPosition(this.node.getPositionX() + this.speed, this.node.getPositionY());

        if (this.node.getPositionX() > 375) {
            this.isDead = true;
        }
    }
}
