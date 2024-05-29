// ==UserScript==
// @name         YT Just Audio
// @version      0.11
// @description  Hide the video to optimize performance
// @author       Luiz
// @match        *://*.youtube.com/*
// @grant        GM_addStyle
// ==/UserScript==

(() => {
  const svgOff = '<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24" viewBox="0 0 24 24" width="24" focusable="false" style="pointer-events: none; display: block; width: 100%; height: 100%;"><path d="M12 4v9.38c-.73-.84-1.8-1.38-3-1.38-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V8h6V4h-7zM9 19c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm9-12h-5V5h5v2z" fill="#fff"></path></svg>';
  const svgOn = '<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24" viewBox="0 0 24 24" width="24" focusable="false" style="pointer-events: none; display: block; width: 100%; height: 100%;"><path d="M12 4v9.38c-.73-.84-1.8-1.38-3-1.38-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V8h6V4h-7z" fill="#f00"></path></svg>';
  function toogleAudioOnly(set, cookie = true) {
    if (set === '1') {
      document.querySelector('#audio_only_style').innerHTML = '#player #container video { display: none; }';
      document.querySelector('#audio_only_placeholder').style.display = 'block';
      document.querySelector('#audio_only_button').innerHTML = svgOn;
      if (cookie) document.cookie = 'audio_only=1;path=/';
    } else {
      document.querySelector('#audio_only_style').innerHTML = '';
      document.querySelector('#audio_only_placeholder').style.display = 'none';
      document.querySelector('#audio_only_button').innerHTML = svgOff;
      if (cookie) document.cookie = 'audio_only=0;path=/';
    }
    document.querySelector('#player #container video').focus();
  }
  function waitForElements(selector) {
    return new Promise((resolve, reject) => {
      const calldate = new Date();
      const interval = setInterval(() => {
        if (new Date() - calldate > 20000) {
          clearInterval(interval);
          const error = new Error('Timeout');
          reject(error);
        }
        if (selector.includes('XPATH')) {
          const element = document.evaluate(selector.replace('XPATH', ''), document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
          if (element.snapshotLength > 0) {
            clearInterval(interval);
            resolve(Array.from({ length: element.snapshotLength }, (_, i) => element.snapshotItem(i)));
          }
        } else {
          const element = document.querySelectorAll(selector);
          if (element.length > 0) {
            clearInterval(interval);
            resolve(Array.from(element));
          }
        }
      }, 100);
    });
  }
  window.addEventListener('load', () => {
    const interval = setInterval(() => {
      // Checking if the reference is ready
      if (!document.querySelector('#player #container video')) return;
      clearInterval(interval);

      // Checking if the cookie exists and creating it if it doesn't
      if (document.cookie.indexOf('audio_only') === -1) {
        document.cookie = 'audio_only=0;path=/';
      }

      // Checking if the style exists and creating it if it doesn't
      if (document.querySelector('#audio_only_style') === null) {
        const style = document.createElement('style');
        style.id = 'audio_only_style';
        style.innerHTML = '#player #container video {}';
        document.head.appendChild(style);
      }

      // Checking if the audio_only is on or off
      const audioOnlyValue = document.cookie
        .split(';')
        .filter((item) => item.trim().startsWith('audio_only='))[0]
        .split('=')[1];

      // Creating the button
      const button = document.createElement('button');
      button.innerHTML = audioOnlyValue === '1' ? svgOn : svgOff;
      button.classList.add('ytp-button');
      button.style.scale = '0.7';
      button.id = 'audio_only_button';
      button.onclick = () => {
        const audioOnlyValue = document.cookie
          .split(';')
          .filter((item) => item.trim().startsWith('audio_only='))[0]
          .split('=')[1];
        toogleAudioOnly(audioOnlyValue === '1' ? '0' : '1');
      };
      document.querySelector('[data-tooltip-target-id="ytp-autonav-toggle-button"]').insertAdjacentElement('beforebegin', button);

      // Creating the placeholder
      const placeholder = document.createElement('img');
      // placeholder.src = 'https://www.gstatic.com/youtube/img/promos/growth/music_premium_lp2_header_background_dark_1440x578.webp';
      placeholder.src = 'https://www.gstatic.com/youtube/media/ytm/images/sbg/wsbg@4000x2250.png';
      placeholder.style.width = '-webkit-fill-available';
      placeholder.style.display = audioOnlyValue === '1' ? 'block' : 'none';
      placeholder.id = 'audio_only_placeholder';
      document.querySelector('#player #container video').insertAdjacentElement('beforebegin', placeholder);

      toogleAudioOnly(audioOnlyValue);

      /* // Future detection of dark mode
          const color = window.getComputedStyle(document.querySelector('#video-title'))?.getPropertyValue('color')?.match(/\d+/g);
          const brightness = Math.round((parseInt(color[0]) * 299 + parseInt(color[1]) * 587 + parseInt(color[2]) * 114) / 1000);
          if (brightness > 125) {
          button.style.filter = 'invert(100%)';
          } */

      if (!cookieStore) return;
      cookieStore.addEventListener('change', (e) => {
        const changedaudio_only = e.changed.find((item) => item.name === 'audio_only');
        if (changedaudio_only) {
          const audioOnlyValue = document.cookie
            .split(';')
            .filter((item) => item.trim().startsWith('audio_only='))[0]
            .split('=')[1];
          toogleAudioOnly(audioOnlyValue, false);
        }
      });
      document.addEventListener('visibilitychange', async () => {
        const settingsToogle = await waitForElements('.ytp-settings-button');
        settingsToogle[0].click();
        const allButtons = await waitForElements('.ytp-menuitem');
        allButtons.find((e) => e.innerText.match(/\d+p/)).click();
        const qualityArray = Array.from(document.querySelectorAll('.ytp-quality-menu .ytp-menuitem'));
        const audioOnlyValue = document.cookie
          .split(';')
          .filter((item) => item.trim().startsWith('audio_only='))[0]
          .split('=')[1];
        toogleAudioOnly(audioOnlyValue === '1' ? '0' : '1');
        if (document.visibilityState === 'hidden') {
          // Select lowest quality
          qualityArray[qualityArray.length - 2].click();
          toogleAudioOnly('1');
        } else {
          // Select auto
          qualityArray[qualityArray.length - 1].click();
          toogleAudioOnly('0');
        }
        // Close the 1080p premium bitrate popup
        document.querySelector('ytd-offline-promo-renderer button[aria-label="Agora não"]')?.click();
      });
    }, 100);
  });
})();
