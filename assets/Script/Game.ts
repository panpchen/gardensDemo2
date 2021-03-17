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

const CONFIG_LENGTH = CONFIG_TXT_LIST.length;

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
  @property([cc.Node])
  arrowList: cc.Node[] = [];
  @property(cc.Node)
  bubble: cc.Node = null;
  @property(cc.Label)
  countLabel: cc.Label = null;
  @property(cc.Animation)
  overAni: cc.Animation = null;
  @property(cc.Node)
  arrowContent: cc.Node = null;
  private _canClick: boolean = false;
  private _lastTween = null;
  private _clickList: number[] = [];

  onLoad() {
    this.mainBg.active = true;
    this.arrowContent.active = false;
    this._setBubbleStatus(false);
    this.overAni.node.active = false;
    this.countLabel.node.opacity = 0;

    this._startTitleAni(() => {
      this._updateCountLabel(0);
      this._startBgAni(() => {
        this._fadeInCountLabel(() => {
          this.arrowContent.active = true;
          this._canClick = true;
        });
      });
    });

    this.arrowContent.children.forEach((arrow) => {
      cc.tween(arrow)
        .repeatForever(
          cc
            .tween()
            .by(0.2, { position: cc.v2(25, -25) })
            .delay(1)
            .by(0.2, { position: cc.v2(-25, 25) })
        )
        .start();
    });
  }

  _startTitleAni(callback: Function) {
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

  _fadeInCountLabel(callback: Function) {
    this.countLabel.node.opacity = 0;
    cc.tween(this.countLabel.node)
      .to(0.8, { opacity: 255 })
      .call(() => {
        callback && callback();
      })
      .start();
  }

  _startBgAni(callback: Function) {
    let i = 0;
    this.schedule(
      () => {
        if (i >= this.bgs.length) {
          this.unscheduleAllCallbacks();
          callback && callback();
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
    this.arrowList[id].active = false;
    this._setBubbleStatus(true, id);
    this.bubble.scale = 0;
    this._lastTween = cc
      .tween(this.bubble)
      .to(1, { scale: 1 }, { easing: "bounceOut" })
      .start();

    this.scheduleOnce(() => {
      this._lastTween = null;
    }, 1);
    const label = this.bubble.getChildByName("bg").getChildByName("label");
    label.getComponent(cc.Label).string = CONFIG_TXT_LIST[id];

    this._setClickList(id);
  }

  _setClickList(id: number) {
    if (this._clickList.indexOf(id) != -1) {
      return;
    }

    this._clickList.push(id);
    this._updateCountLabel(this._clickList.length);
    if (this._clickList.length >= CONFIG_LENGTH) {
      this.overAni.node.active = true;
      this.overAni.play();
    }
  }

  _setBubbleStatus(enable: boolean, id: number = -1) {
    this.bubble.active = enable;
    const bubbleBg = this.bubble.getChildByName("bg");
    if (enable) {
      switch (id) {
        case 0:
          bubbleBg.setPosition(cc.v2(-26, -130));
          break;
        case 1:
          bubbleBg.setPosition(cc.v2(-220, -56));
          break;
        case 2:
          bubbleBg.setPosition(cc.v2(192, -75));
          break;
      }
    }
  }
  onClickHideBubble() {
    this._setBubbleStatus(false);
  }

  _updateCountLabel(num: number) {
    this.countLabel.string = `${num}/${CONFIG_LENGTH}`;
  }
}
