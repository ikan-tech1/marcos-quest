class VirtualInputManager {
  left = false;
  right = false;
  jumpHeld = false;
  private jumpPressed = false;
  private dashPressed = false;
  private firePressed = false;

  setJump(down: boolean): void {
    if (down && !this.jumpHeld) this.jumpPressed = true;
    this.jumpHeld = down;
  }

  setDash(): void {
    this.dashPressed = true;
  }

  setFire(): void {
    this.firePressed = true;
  }

  consumeJumpPressed(): boolean {
    if (!this.jumpPressed) return false;
    this.jumpPressed = false;
    return true;
  }

  consumeDashPressed(): boolean {
    if (!this.dashPressed) return false;
    this.dashPressed = false;
    return true;
  }

  consumeFirePressed(): boolean {
    if (!this.firePressed) return false;
    this.firePressed = false;
    return true;
  }

  reset(): void {
    this.left = false;
    this.right = false;
    this.jumpHeld = false;
    this.jumpPressed = false;
    this.dashPressed = false;
    this.firePressed = false;
  }
}

export const VirtualInput = new VirtualInputManager();
