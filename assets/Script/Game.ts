// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

const CONFIG_TXT_LIST = [
  "西方园林的林荫道随中心分散，中式园林亭台分布较为随意，亭台与假山结合。",
  "西方园林重视摆放的规则感、秩序感，中式园林体现园林与景色相结合。",
  "西方园林建筑材料以大理石质为主，中式园林建筑材料则以土木为主。",
];

@ccclass
export default class Game extends cc.Component {
  @property(cc.Node)
  mainBg: cc.Node = null;
  @property(cc.Node)
  title: cc.Node = null;
  @property([cc.Node])
  bgs: cc.Node[] = [];
  @property([cc.Node])
  borderList: cc.Node[] = [];
  @property(cc.Node)
  bubble: cc.Node = null;
  private _canClick: boolean = false;
  private _lastTween = null;

  onLoad() {
    this.mainBg.active = true;
    this._startTitleAni(this._startBgAni.bind(this));
  }

  _startTitleAni(callback) {
    this.title.y = cc.winSize.height;
    cc.tween(this.title)
      .to(1.5, { y: 60 }, { easing: "bounceOut" })
      .delay(0.8)
      .call(() => {
        cc.tween(this.title.parent)
          .to(1, { opacity: 0 })
          .call(() => {
            callback && callback();
          })
          .start();
      })
      .start();
  }

  _startBgAni() {
    let i = 0;
    this.schedule(
      () => {
        if (i >= this.bgs.length) {
          this.unscheduleAllCallbacks();
          this._canClick = true;
          return;
        }

        cc.tween(this.bgs[i])
          .to(0.8, { x: i % 2 == 0 ? -310 : 310 }, { easing: "smooth" })
          .start();

        i++;
      },
      1,
      cc.macro.REPEAT_FOREVER,
      0.01
    );
  }

  onClickItem(evt, parm) {
    if (!this._canClick || this._lastTween) {
      return;
    }
    cc.Tween.stopAllByTarget(this.bubble);
    const id = Number(parm);
    this.borderList[id].active = true;
    this.bubble.active = true;
    this.bubble.scale = 0;
    const mask = this.bubble.getChildByName("mask");
    mask.opacity = 0;
    this._lastTween = cc
      .tween(this.bubble)
      .to(1, { scale: 1 }, { easing: "bounceOut" })
      .call(() => {
        mask.opacity = 170;
      })
      .start();

    this.scheduleOnce(() => {
      this._lastTween = null;
    }, 1);
    const label = this.bubble.getChildByName("label");
    label.getComponent(cc.Label).string = CONFIG_TXT_LIST[id];
  }

  onClickHideBubble() {
    this.bubble.active = false;
  }
}
