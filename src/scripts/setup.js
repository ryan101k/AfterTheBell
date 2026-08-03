/* 폐장 후, 우리 — 공통 UI와 저장 설정 */
Config.history.maxStates = 140;
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

setup.standeeCharacters = {
  sera: { file: 'sera-neutral.png', name: '윤새라' },
  yujin: { file: 'yujin-neutral.png', name: '강유진' },
  chaerin: { file: 'chaerin-neutral.png', name: '한채린' },
  chaewon: { file: 'chaewon-neutral.png', name: '서채원' },
  yuna: { file: 'yuna-neutral.png', name: '강유나' },
  sohee: { file: 'sohee-neutral.png', name: '윤소희' }
};

setup.dangerousAffectionStage = function (value) {
  const score = Math.min(100, Math.max(0, Number(value) || 0));
  if (score >= 100) return '확신';
  if (score >= 90) return '사랑';
  if (score >= 80) return '호감';
  if (score >= 65) return '특별함';
  if (score >= 50) return '신뢰';
  if (score >= 30) return '친구';
  if (score >= 10) return '익숙함';
  return '낯섦';
};

setup.standeeScenes = {
  'sera-entry': 'sera',
  'sera-test': 'sera',
  'sera-solo': 'sera',
  'yujin-entry': 'yujin',
  hospital: 'yujin',
  'yujin-test': 'yujin',
  'yujin-solo': 'yujin',
  'chaerin-entry': 'chaerin',
  'chaerin-test': 'chaerin',
  'chaerin-solo': 'chaerin',
  'chaewon-thread': 'chaewon',
  'yuna-thread': 'yuna',
  'sohee-thread': 'sohee'
};

setup.resolveStandeeCharacters = function () {
  const title = passage();

  if (/^1장 · /.test(title)) {
    if (/닫힌 작업실|처음 저장한 번호/.test(title)) {
      return ['sera', 'yujin'];
    }
    if (/열흘째의 초인종|두 개의 진술|제복을 벗지 않은 차/.test(title)) {
      return ['yujin'];
    }
    return ['sera'];
  }

  if (/^2장 · /.test(title)) {
    if (/세 이름을 기다린 날|아직 고백하지 않은 사람들/.test(title)) {
      return ['sera', 'yujin', 'chaerin'];
    }
    if (/자기 이름의 그림|불이 꺼진 전시장/.test(title)) {
      return ['sera', 'chaerin'];
    }
    if (/사건 없는 확인|제복 없는 저녁|오지 않은 안부|먼저 온 답장|비번의 영화|엔딩 크레딧|구조받지 않은 사람|지키지 않는 밤|야간 순찰의 편의점|캔커피 두 개|현관의 흔적|묻지 않은 이름|먼저 취소한 약속|미룬 저녁|열이 나는 비번|진통제 봉투/.test(title)) {
      return ['yujin'];
    }
    if (/로비의 한채린|값을 매기지 않은 초대|예약 없는 저녁|가격 없는 산책|육교 위의 십 분|답장이 늦은 밤|예약하지 않은 답장|직접 고른 선물|영수증 없는 화분|약속된 한 시간|수행원 없는 버스|두 정거장|준비되지 않은 방문|값이 없는 라면|거절된 예약|비어 있는 토요일|편의점 우산|천 원짜리 비닐/.test(title)) {
      return ['chaerin'];
    }
    return ['sera'];
  }

  if (/^광기 3인 · /.test(title)) {
    return ['sera', 'yujin', 'chaerin'];
  }
  if (/^3S · /.test(title)) {
    return ['sera'];
  }
  if (/^3Y · /.test(title)) {
    return ['yujin'];
  }
  if (/^3C · /.test(title)) {
    return ['chaerin'];
  }

  if (/^3장 · /.test(title)) {
    if (/새라에게 한 고백|하나뿐인 열쇠|새라가 여는 문/.test(title)) {
      return ['sera'];
    }
    if (/유진에게 한 고백|비상 연락망의 첫째|유진에게 보내는 신호/.test(title)) {
      return ['yujin'];
    }
    if (/채린에게 한 고백|비어 있지 않은 일정표|채린이 비운 토요일/.test(title)) {
      return ['chaerin'];
    }
    return ['sera', 'yujin', 'chaerin'];
  }

  const sceneCharacter = setup.standeeScenes[State.variables.scene];
  return sceneCharacter ? [sceneCharacter] : [];
};

setup.updateStandee = function () {
  const characterKeys = setup.resolveStandeeCharacters();
  const $scene = $('#passages .vn-scene').last();

  if (!characterKeys.length || !$scene.length) {
    return;
  }

  const $stage = $('<div>', {
    class: 'vn-standee-stage vn-standee-stage--count-' + characterKeys.length,
    'aria-hidden': 'true'
  });

  characterKeys.forEach(function (characterKey, index) {
    const character = setup.standeeCharacters[characterKey];
    if (!character) {
      return;
    }
    const $standee = $('<div>', {
      class: 'vn-standee vn-standee--' + characterKey + ' vn-standee--slot-' + index
    });
    const $image = $('<img>', {
      src: '../assets/images/standing/' + character.file,
      alt: '',
      loading: 'eager',
      decoding: 'async'
    });
    $standee.append($image);
    $stage.append($standee);
  });

  $scene.addClass('has-standee');
  $stage.insertBefore($scene.children('.vn-dialogue').first());
};

setup.captureBacklog = function () {
  if (tags().includes('menu') || tags().includes('title')) {
    return;
  }

  const $dialogue = $('#passages .vn-dialogue').last();
  if (!$dialogue.length) {
    return;
  }

  const lines = [];
  $dialogue.find('p, .phone-message b, .phone-message span').each(function () {
    const line = $(this).text().replace(/\s+/g, ' ').trim();
    if (line && lines[lines.length - 1] !== line) {
      lines.push(line);
    }
  });

  if (!lines.length) {
    return;
  }

  const log = Array.isArray(State.variables.dialogueLog) ? State.variables.dialogueLog : [];
  const signature = lines.join('\n');
  const previous = log[log.length - 1];
  if (previous && previous.passage === passage() && (previous.lines || []).join('\n') === signature) {
    State.variables.dialogueLog = log;
    return;
  }

  log.push({
    passage: passage(),
    chapter: State.variables.chapter || 0,
    lines: lines,
    choice: ''
  });
  if (log.length > 120) {
    log.splice(0, log.length - 120);
  }
  State.variables.dialogueLog = log;
};

setup.rememberBacklogChoice = function (choiceText) {
  const log = State.variables.dialogueLog;
  if (!Array.isArray(log) || !log.length) {
    return;
  }
  log[log.length - 1].choice = choiceText.replace(/\s+/g, ' ').trim();
};

setup.renderBacklog = function () {
  const log = Array.isArray(State.variables.dialogueLog) ? State.variables.dialogueLog : [];
  const $body = $('[data-vn-backlog-body]').empty();

  if (!log.length) {
    $('<p>', { class: 'vn-backlog__empty', text: '아직 기록된 대화가 없습니다.' }).appendTo($body);
    return;
  }

  log.forEach(function (entry) {
    const $entry = $('<article>', { class: 'vn-backlog__entry' });
    $('<p>', {
      class: 'vn-backlog__meta',
      text: 'CH. ' + entry.chapter + ' · ' + entry.passage
    }).appendTo($entry);
    (entry.lines || []).forEach(function (line) {
      $('<p>', { class: 'vn-backlog__line', text: line }).appendTo($entry);
    });
    if (entry.choice) {
      $('<p>', {
        class: 'vn-backlog__choice',
        text: '선택 · ' + entry.choice
      }).appendTo($entry);
    }
    $entry.appendTo($body);
  });
};

setup.openBacklog = function () {
  setup.renderBacklog();
  const $backlog = $('[data-vn-backlog]');
  $backlog.prop('hidden', false).addClass('is-open');
  $('body').addClass('vn-backlog-open');
  const body = $('[data-vn-backlog-body]')[0];
  if (body) {
    body.scrollTop = body.scrollHeight;
  }
  $backlog.find('[data-vn-backlog-close]').trigger('focus');
};

setup.closeBacklog = function () {
  $('[data-vn-backlog]').removeClass('is-open').prop('hidden', true);
  $('body').removeClass('vn-backlog-open');
  $('[data-vn-action="backlog"]').trigger('focus');
};

$(document).on('click.vnui', '[data-vn-action]', function () {
  const action = this.dataset.vnAction;
  if (action === 'saves') {
    setup.openSaves();
  } else if (action === 'continue') {
    setup.continueGame();
  } else if (action === 'restart') {
    UI.restart();
  } else if (action === 'backlog') {
    setup.openBacklog();
  } else if (action === 'bgm' && setup.bgm) {
    setup.bgm.toggle();
  }
});

$(document).on('click.vnbacklog', '[data-vn-backlog-close]', function () {
  setup.closeBacklog();
});

$(document).on('click.vnbacklog', '[data-vn-backlog]', function (event) {
  if (event.target === this) {
    setup.closeBacklog();
  }
});

$(document).on('keydown.vnbacklog', function (event) {
  if (event.key === 'Escape' && !$('[data-vn-backlog]').prop('hidden')) {
    setup.closeBacklog();
  }
});

$(document).on('pointerdown.vnbacklog keydown.vnbacklog', '#passages .vn-choices a, #passages .vn-choices button', function (event) {
  if (event.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ') {
    return;
  }
  setup.rememberBacklogChoice($(this).text());
});

$(document).on('click.vnui', '[data-vn-passage]', function () {
  Engine.play(this.dataset.vnPassage);
});

$(document).on(':passagedisplay.vnui', function () {
  setup.hideChoiceScores();
  setup.updateStandee();
  setup.captureBacklog();

  const chapter = State.variables.chapter || 0;
  $('[data-vn-chapter]').text(chapter);

  const freedomAffection = State.variables.affection || {};
  const freedomMode = chapter >= 4 && chapter <= 7 && !['locked', 'friend'].includes(State.variables.freedomMode);
  const showAffection = freedomMode;
  const cast = [['채원', freedomAffection.chaewon], ['유나', freedomAffection.yuna], ['소희', freedomAffection.sohee]];
  const $hud = $('[data-affection-hud]');
  $hud.prop('hidden', !showAffection);
  $hud.attr('data-mode', 'freedom');
  cast.forEach(function (character, index) {
    $('[data-affection-label="' + index + '"]').text(character[0]);
    $('[data-affection-value="' + index + '"]').text(Math.min(100, character[1] || 0));
    $('[data-affection-stage="' + index + '"]').text('');
  });

  const notice = State.variables.affectionNotice;
  if (notice && freedomMode) {
    const $toast = $('[data-affection-toast]');
    window.clearTimeout(setup.affectionToastTimer);
    window.clearTimeout(setup.affectionToastHideTimer);
    let noticeText = notice;
    $toast.stop(true, true).text(noticeText).prop('hidden', false).addClass('is-visible');
    setup.affectionToastTimer = window.setTimeout(function () {
      $toast.removeClass('is-visible');
      setup.affectionToastHideTimer = window.setTimeout(function () {
        $toast.prop('hidden', true);
      }, 220);
    }, 1600);
  }
  if (notice) {
    State.variables.affectionNotice = '';
  }

  if (setup.bgm) {
    setup.bgm.sync();
  }
});
