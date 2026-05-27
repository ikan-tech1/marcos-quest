import { GameBridge } from '../systems/GameBridge';
import { Storage } from '../systems/Storage';
import { GameState } from '../systems/GameState';
import { UISounds } from '../utils/uiSounds';

interface Props {
  shopCoins: number;
  nextLevelIndex: number;
  characterId: string;
}

export function ShopOverlay({ nextLevelIndex, characterId }: Props) {
  const buyLife = () => {
    if (!Storage.spendShopCoins(30)) return;
    UISounds.confirm();
    GameState.addLife();
    GameBridge.emit('shop-update', { shopCoins: Storage.getShopCoins() });
  };

  const buyPowerUp = () => {
    if (!Storage.spendShopCoins(25)) return;
    UISounds.confirm();
    Storage.addPowerUpStash();
    GameBridge.emit('shop-update', { shopCoins: Storage.getShopCoins() });
  };

  const buyHint = () => {
    if (!Storage.spendShopCoins(15)) return;
    UISounds.confirm();
    GameBridge.emit('shop-hint', { message: 'Checkpoints save your spot — touch the green flags!' });
    GameBridge.emit('shop-update', { shopCoins: Storage.getShopCoins() });
  };

  const continueGame = () => {
    UISounds.confirm();
    GameState.nextLevel();
    GameBridge.emit('continue-from-shop', { levelIndex: nextLevelIndex, characterId });
  };

  const coins = Storage.getShopCoins();

  return (
    <div className="overlay overlay-shop screen-enter">
      <div className="wood-sign shop-sign">
        <div className="wood-sign-post wood-sign-post--left" aria-hidden="true" />
        <div className="wood-sign-post wood-sign-post--right" aria-hidden="true" />
        <div className="wood-sign-board">
          <h2 className="shop-title">🏪 KINGDOM SHOP</h2>
          <p className="shop-subtitle">Spend coins earned on your quest</p>
          <p className="shop-balance">
            <span className="hud-coin-icon" aria-hidden="true" />
            {coins} coins available
          </p>
          <div className="shop-grid">
            <button type="button" className="shop-item" onClick={buyLife} disabled={coins < 30}>
              <span className="shop-item-icon">♥</span>
              <span className="shop-item-name">Extra Life</span>
              <span className="shop-item-price">30 coins</span>
            </button>
            <button type="button" className="shop-item" onClick={buyPowerUp} disabled={coins < 25}>
              <span className="shop-item-icon">★</span>
              <span className="shop-item-name">Power Stash</span>
              <span className="shop-item-price">25 coins</span>
            </button>
            <button type="button" className="shop-item" onClick={buyHint} disabled={coins < 15}>
              <span className="shop-item-icon">💡</span>
              <span className="shop-item-name">Hint Scroll</span>
              <span className="shop-item-price">15 coins</span>
            </button>
          </div>
          <button type="button" className="btn-primary btn-primary--wide" onClick={continueGame}>
            ▶ CONTINUE QUEST
          </button>
        </div>
      </div>
    </div>
  );
}
