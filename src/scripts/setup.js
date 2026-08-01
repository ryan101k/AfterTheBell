/* 폐장 후, 우리 — 공통 UI와 저장 설정 */
Config.history.maxStates = 80;
Config.saves.maxAutoSaves = 3;
Config.saves.maxSlotSaves = 8;
Config.saves.descriptions = function () {
  return passage();
};
Config.saves.isAllowed = function (saveType) {
  if (saveType === Save.Type.Auto) {
    return tags().includes('autosave');
  }
  return !tags().includes('menu');
};

setup.openSaves = function () {
  UI.saves();
};

setup.continueGame = function () {
  if (!Save.browser || Save.browser.size < 1) {
    return;
  }
  Save.browser.continue().catch(function (error) {
    console.error(error);
    UI.alert('저장 데이터를 불러오지 못했습니다.');
  });
};

$(document).on('click.vnui', '[data-vn-action]', function () {
  const action = this.dataset.vnAction;
  if (action === 'saves') {
    setup.openSaves();
  } else if (action === 'continue') {
    setup.continueGame();
  } else if (action === 'restart') {
    UI.restart();
  }
});

$(document).on('click.vnui', '[data-vn-passage]', function () {
  Engine.play(this.dataset.vnPassage);
});

$(document).on(':passagedisplay.vnui', function () {
  const chapter = State.variables.chapter || 0;
  $('[data-vn-chapter]').text(chapter);
});
