/* Momac Holdings contact form: topic routing, validation, sending. */
(function () {
  'use strict';
  var form = document.getElementById('contact-form');
  if (!form) return;

  form.noValidate = true; // this script validates; without it the browser does
  var radios = Array.prototype.slice.call(form.querySelectorAll('input[name=topic]'));
  var route = document.getElementById('cf-route');
  var routed = document.getElementById('cf-routed');
  var success = document.getElementById('cf-success');
  var failure = document.getElementById('cf-failure');
  var submit = document.getElementById('cf-submit');
  var EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s.]+$/;

  function chosen() {
    for (var i = 0; i < radios.length; i++) if (radios[i].checked) return radios[i];
    return null;
  }

  function updateRoute() {
    var r = chosen();
    routed.value = r ? r.getAttribute('data-company') : '';
    var site = r ? r.getAttribute('data-site') : '';
    if (site) {
      route.querySelector('b').textContent = r.getAttribute('data-company');
      var a = route.querySelector('a');
      a.href = site;
      a.textContent = r.getAttribute('data-host');
      route.hidden = false;
    } else {
      route.hidden = true;
    }
    if (r) setError('topic', '');
  }

  // ?topic=energy preselects a subject (links from the group map use it)
  var wanted = new URLSearchParams(window.location.search).get('topic');
  if (wanted) {
    radios.forEach(function (r) { if (r.value === wanted) r.checked = true; });
  }
  radios.forEach(function (r) { r.addEventListener('change', updateRoute); });
  updateRoute();

  function setError(name, text) {
    var box = document.getElementById('err-' + name);
    if (!box) return;
    box.textContent = text;
    box.hidden = !text;
    var control = form.elements[name];
    if (control && control.setAttribute) control.setAttribute('aria-invalid', text ? 'true' : 'false');
  }

  function validate() {
    var first = null;
    function fail(name, key, focusEl) {
      setError(name, form.getAttribute('data-err-' + key));
      if (!first) first = focusEl;
    }
    if (!chosen()) fail('topic', 'topic', radios[0]); else setError('topic', '');
    var name = form.elements.name;
    if (!name.value.trim()) fail('name', 'name', name); else setError('name', '');
    var email = form.elements.email;
    var v = email.value.trim();
    if (!v) fail('email', 'email', email);
    else if (!EMAIL.test(v)) fail('email', 'email-bad', email);
    else setError('email', '');
    var message = form.elements.message;
    if (!message.value.trim()) fail('message', 'message', message); else setError('message', '');
    if (first) first.focus();
    return !first;
  }

  ['name', 'email', 'message'].forEach(function (n) {
    form.elements[n].addEventListener('input', function () {
      if (form.elements[n].getAttribute('aria-invalid') === 'true') setError(n, '');
    });
  });

  function showFailure() {
    failure.hidden = false;
    failure.scrollIntoView({ block: 'nearest' });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    failure.hidden = true;
    if (!validate()) return;
    if (form.elements._gotcha.value) return; // filled by a bot: drop silently
    var endpoint = form.getAttribute('data-endpoint');
    if (!endpoint) { showFailure(); return; }

    var r = chosen();
    var payload = {
      subject: r.getAttribute('data-label'),
      routed_to: r.getAttribute('data-company'),
      name: form.elements.name.value.trim(),
      company: form.elements.company.value.trim(),
      email: form.elements.email.value.trim(),
      message: form.elements.message.value.trim(),
      _subject: form.elements._subject.value + ': ' + r.getAttribute('data-company')
    };
    var label = submit.innerHTML;
    submit.disabled = true;
    submit.textContent = form.getAttribute('data-sending');

    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (res) {
      if (!res.ok) throw new Error('status ' + res.status);
      form.hidden = true;
      document.getElementById('cf-success-co').textContent = payload.routed_to;
      success.hidden = false;
      success.focus();
    }).catch(function () {
      showFailure();
    }).then(function () {
      submit.disabled = false;
      submit.innerHTML = label;
    });
  });
})();
