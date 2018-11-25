import { Circle } from "./Circle";
import { Enemy } from "./Enemy";
import { Mission, EnemyData } from "./Mission";
import { Boss } from "./Boss";

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

enum E_Step {
    LoadMissionData,
    PreLoadPrefab,
    InGame
}

@ccclass
export default class HorizontalScene extends cc.Component {

    m_EscapeTime: Number = 0;

    m_MissionData: Mission = null;
    m_PrefabDict: { [name: number]: cc.Prefab } = {};
    m_FreePool: { [name: number]: Enemy[] } = {};
    m_ActiveList: Enemy[] = [];

    m_Boss: Boss = null;

    m_WaveIndex: number = 0;
    m_EnemyIndex: number = 0;

    @property(cc.Label)
    m_Loading: cc.Label = null;

    @property(cc.Component)
    m_BtnPanel: cc.Component = null;

    @property(cc.Label)
    m_InputNumber: cc.Label = null;

    @property(cc.Button)
    m_BtnList: cc.Button[] = [];

    m_Step: E_Step = E_Step.LoadMissionData;
    m_ResourcesCount: number = 0;

    onLoad() {

        this.m_Step = E_Step.LoadMissionData;

        this.loadMission(1);

        for (let i = 0; i < this.m_BtnList.length; i++) {
            this.m_BtnList[i].node.on('click', this.btnClick, this);
        }

        this.m_InputNumber.string = "";
    }

    loadMission(id) {

        let _self = this;

        cc.loader.loadRes("mission_" + id, function (err, jsonAsset) {

            if (err) {
                return;
            }

            cc.loader.loadRes("prefab/enemy/Boss", function (err, prefab) {
                if (err) {
                    return;
                }

                _self.m_PrefabDict[0] = prefab;
                // _self.m_Boss = cc.instantiate(prefab)
            });

            let _m = new Mission();
            let _d = jsonAsset.json;
            let prefabIds: number[] = [];

            for (let i = 0; i < _d.length; i++) {
                _m.enemys[i] = new EnemyData();
                _m.enemys[i].id = HorizontalScene.randomNumber(_d[i]["id_min"], _d[i]["id_max"]) * 100;
                _m.enemys[i].speed = HorizontalScene.randomNumber(_d[i]["speed_min"], _d[i]["speed_max"]);
                _m.enemys[i].num_min = _d[i]["num_Min"];
                _m.enemys[i].num_max = _d[i]["num_Max"];
                _m.enemys[i].animationSpeed = _d[i]["anim_speed"];
                _m.enemys[i].isBoss = _d[i]["isBoss"] == 1;
                if (_m.enemys[i].isBoss) {
                    _m.enemys[i].circleCount = _d[i]["circle_count"];
                    _m.enemys[i].firstChildDelay = _d[i]["first_child_delay"];
                    _m.enemys[i].createChildIntervalMin = _d[i]["create_interval_min"];
                    _m.enemys[i].createChildIntervalMax = _d[i]["create_interval_max"];
                    _m.enemys[i].childIdMin = _d[i]["child_id_min"];
                    _m.enemys[i].childIdMax = _d[i]["child_id_max"];
                } else {
                    // 记录需要预加载的资源
                    if (prefabIds.indexOf(_m.enemys[i].id) == -1) {
                        prefabIds.push(_m.enemys[i].id);
                    }
                }
            }

            _self.m_ResourcesCount = prefabIds.length;
            _self.m_MissionData = _m;
            _self.m_Step = E_Step.PreLoadPrefab;

            // 预加载prefab
            for (let i = 0; i < prefabIds.length; i++) {
                cc.loader.loadRes("prefab/enemy/Enemy_" + prefabIds[i], function (err, prefab) {
                    if (err) {
                        return;
                    }
                    _self.m_PrefabDict[prefabIds[i]] = prefab;
                    _self.m_ResourcesCount -= 1;
                });
            }
        });
    }

    start() {
    }

    generalEnemy(data): Enemy {

        if (!this.m_PrefabDict[data.id]) {
            return;
        }

        let _enemy: Enemy = null;

        if (typeof this.m_FreePool[data.id] === "undefined") {
            this.m_FreePool[data.id] = [];
        }
        if (this.m_FreePool[data.id].length > 0) {
            _enemy = this.m_FreePool[data.id].pop();
        } else {
            let _newNode = cc.instantiate(this.m_PrefabDict[data.id]);
            _enemy = _newNode.getComponent(Enemy);
        }
        _enemy.node.active = true;
        _enemy.node.parent = this.node;
        _enemy.init(data);
        return _enemy;
    }

    releaseEnemy(enemy: Enemy) {
        let _index = this.m_ActiveList.indexOf(enemy);
        if (_index != -1) {
            this.m_ActiveList.splice(_index, 1);

            let id: number = enemy.data.id;
            if (typeof this.m_FreePool[id] !== "undefined") {
                this.m_FreePool[id].push(enemy);
                enemy.node.active = false;
            } else {
                enemy.node.destroy();
            }
        }
    }

    update(dt) {

        if (this.m_Step == E_Step.LoadMissionData) {

            this.m_Loading.string = "加载地图配置..."

        } else if (this.m_Step == E_Step.PreLoadPrefab) {

            this.m_Loading.string = "预加载地图资源..."

            if (this.m_ResourcesCount == 0) {
                this.m_Loading.node.active = false;
                this.m_BtnPanel.node.active = true;
                this.m_InputNumber.node.active = true;
                this.m_Step = E_Step.InGame;
            }
        } else if (this.m_Step == E_Step.InGame) {
            let _enemyData: EnemyData = this.m_MissionData.enemys[this.m_EnemyIndex];
            if (this.m_ActiveList.length == 0
                && (this.m_Boss == null || this.m_Boss.node.active == false)) {
                if (!_enemyData.isBoss) {
                    let _enemy = this.generalEnemy(_enemyData);
                    _enemy.node.setPosition(-400, HorizontalScene.randomNumber(200, cc.winSize.height * .5 - 200));
                    this.m_ActiveList.push(_enemy);
                } else {
                    if (this.m_Boss == null) {
                        this.m_Boss = cc.instantiate(this.m_PrefabDict[0]).getComponent(Boss);
                        this.m_Boss.node.parent = this.node;
                    }
                    this.m_Boss.init(_enemyData);
                    this.m_Boss.initChildren();
                    this.m_Boss.node.active = true;
                    this.m_Boss.node.setPosition(-150, 300);
                }
            } else {
                for (let i = this.m_ActiveList.length - 1; i >= 0; i--) {
                    if (this.m_ActiveList[i].isDead) {
                        this.releaseEnemy(this.m_ActiveList[i]);
                        if (this.m_Boss != null && this.m_Boss.node.active != true) {
                            this.m_EnemyIndex += 1;
                            if (this.m_EnemyIndex >= this.m_MissionData.enemys.length) {
                                this.m_EnemyIndex = 0;
                            }
                        }
                    }
                }

                if (this.m_Boss != null && this.m_Boss.node.active && this.m_Boss.isDead) {
                    this.m_Boss.node.active = false;
                }
            }
        }
    }

    btnClick(btn) {

        let _number: string = btn.detail.name.substring(11, 12);

        if (this.m_InputNumber.string.length < 2) {
            this.m_InputNumber.string = this.m_InputNumber.string.concat(_number);
        }

        let _intNumber: number = Number(this.m_InputNumber.string);

        for (let i = 0; i < this.m_ActiveList.length; i++) {
            let _enemy: Enemy = this.m_ActiveList[i];
            if (_enemy.result == _intNumber) {
                this.releaseEnemy(_enemy);
                this.m_InputNumber.string = "";
                if (this.m_Boss == null) {
                    this.m_EnemyIndex += 1;
                    if (this.m_EnemyIndex >= this.m_MissionData.enemys.length) {
                        this.m_EnemyIndex = 0;
                    }
                }
            }
        }

        if (this.m_Boss != null) {
            if (this.m_Boss.result == _intNumber) {
                this.m_Boss.hit();
                if (this.m_Boss.isDead) {
                    this.m_EnemyIndex += 1;
                    if (this.m_EnemyIndex >= this.m_MissionData.enemys.length) {
                        this.m_EnemyIndex = 0;
                    }
                    this.m_Boss.node.active = false;
                }
            }
        }

        if (this.m_InputNumber.string.length == 2) {
            this.m_InputNumber.string = "";
        }
    }

    static randomNumber(min, max): number {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
}
