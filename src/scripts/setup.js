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

setup.hideChoiceScores = function () {
  $('#passages a, #passages button').each(function () {
    const $choice = $(this);
    const original = $choice.text();
    const softened = original
      .replace(/\[(전원|새라|유진|채린|채원|유나|소희)\s*♥\s*[+-]\d+\]/g, function (match, name) {
        return name === '전원' ? '[관계가 움직인다]' : '[' + name + '의 마음이 움직인다]';
      })
      .replace(/\[증거\s*[+-]\d+\]/g, '[다른 단서를 좇는다]')
      .replace(/\[감금 분기\]/g, '[서로에게 전부를 맡긴다]')
      .replace(/\[변화 없음\]/g, '[아무것도 정하지 않는다]');
    if (softened !== original) {
      $choice.text(softened);
    }
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
  } else if (action === 'bgm' && setup.bgm) {
    setup.bgm.toggle();
  }
});

$(document).on('click.vnui', '[data-vn-passage]', function () {
  Engine.play(this.dataset.vnPassage);
});

$(document).on(':passagedisplay.vnui', function () {
  setup.hideChoiceScores();

  const chapter = State.variables.chapter || 0;
  $('[data-vn-chapter]').text(chapter);

  const freedomAffection = State.variables.affection || {};
  const dangerousAffection = State.variables.dangerousAffection || {};
  const freedomMode = chapter >= 4 && chapter <= 7 && State.variables.freedomMode !== 'locked';
  const dangerousMode = chapter >= 1 && chapter <= 3 && State.variables.dangerousOutcome !== 'none';
  const showAffection = freedomMode || dangerousMode;
  const cast = dangerousMode
    ? [['새라', dangerousAffection.sera], ['유진', dangerousAffection.yujin], ['채린', dangerousAffection.chaerin]]
    : [['채원', freedomAffection.chaewon], ['유나', freedomAffection.yuna], ['소희', freedomAffection.sohee]];
  const $hud = $('[data-affection-hud]');
  $hud.prop('hidden', !showAffection);
  $hud.attr('data-mode', dangerousMode ? 'dangerous' : 'freedom');
  cast.forEach(function (character, index) {
    $('[data-affection-label="' + index + '"]').text(character[0]);
    $('[data-affection-value="' + index + '"]').text(character[1] || 0);
  });

  const notice = State.variables.affectionNotice;
  if (notice) {
    const $toast = $('[data-affection-toast]');
    window.clearTimeout(setup.affectionToastTimer);
    window.clearTimeout(setup.affectionToastHideTimer);
    $toast.stop(true, true).text(notice).prop('hidden', false).addClass('is-visible');
    setup.affectionToastTimer = window.setTimeout(function () {
      $toast.removeClass('is-visible');
      setup.affectionToastHideTimer = window.setTimeout(function () {
        $toast.prop('hidden', true);
      }, 220);
    }, 1600);
    State.variables.affectionNotice = '';
  }

  if (setup.bgm) {
    setup.bgm.sync();
  }
});
