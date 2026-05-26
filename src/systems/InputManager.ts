import Phaser from 'phaser';
import { VirtualInput } from './VirtualInput';

export class InputManager {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
    SPACE: Phaser.Input.Keyboard.Key;
    SHIFT: Phaser.Input.Keyboard.Key;
    K: Phaser.Input.Keyboard.Key;
    Z: Phaser.Input.Keyboard.Key;
    J: Phaser.Input.Keyboard.Key;
    ENTER: Phaser.Input.Keyboard.Key;
    ESC: Phaser.Input.Keyboard.Key;
    P: Phaser.Input.Keyboard.Key;
  };

  constructor(scene: Phaser.Scene) {
    const kb = scene.input.keyboard!;
    this.cursors = kb.createCursorKeys();
    this.keys = {
      W: kb.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: kb.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: kb.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: kb.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      SPACE: kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      SHIFT: kb.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT),
      K: kb.addKey(Phaser.Input.Keyboard.KeyCodes.K),
      Z: kb.addKey(Phaser.Input.Keyboard.KeyCodes.Z),
      J: kb.addKey(Phaser.Input.Keyboard.KeyCodes.J),
      ENTER: kb.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER),
      ESC: kb.addKey(Phaser.Input.Keyboard.KeyCodes.ESC),
      P: kb.addKey(Phaser.Input.Keyboard.KeyCodes.P),
    };
  }

  get left(): boolean {
    return this.cursors.left.isDown || this.keys.A.isDown || VirtualInput.left;
  }

  get right(): boolean {
    return this.cursors.right.isDown || this.keys.D.isDown || VirtualInput.right;
  }

  get up(): boolean {
    return this.cursors.up.isDown || this.keys.W.isDown;
  }

  get down(): boolean {
    return this.cursors.down.isDown || this.keys.S.isDown;
  }

  get jumpPressed(): boolean {
    return (
      Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
      Phaser.Input.Keyboard.JustDown(this.keys.W) ||
      Phaser.Input.Keyboard.JustDown(this.keys.SPACE) ||
      VirtualInput.consumeJumpPressed()
    );
  }

  get jumpHeld(): boolean {
    return this.cursors.up.isDown || this.keys.W.isDown || this.keys.SPACE.isDown || VirtualInput.jumpHeld;
  }

  get dashPressed(): boolean {
    return (
      Phaser.Input.Keyboard.JustDown(this.keys.SHIFT) ||
      Phaser.Input.Keyboard.JustDown(this.keys.K) ||
      VirtualInput.consumeDashPressed()
    );
  }

  get firePressed(): boolean {
    return (
      Phaser.Input.Keyboard.JustDown(this.keys.Z) ||
      Phaser.Input.Keyboard.JustDown(this.keys.J) ||
      VirtualInput.consumeFirePressed()
    );
  }

  get pausePressed(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.keys.ESC) || Phaser.Input.Keyboard.JustDown(this.keys.P);
  }

  get startPressed(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.keys.ENTER) || Phaser.Input.Keyboard.JustDown(this.keys.SPACE);
  }
}
