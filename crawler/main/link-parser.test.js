'use strict';


const linkParser = require('./link-parser');
const each = require('jest-each').default;

const largeHtml = `<html>
  <head>
    <title>index</title>
  </head>
  <body>
    <h1>index</h1>
    <div>
      <ul>
        <li><a href="/index.html">index</a></li>
        <li><a href="/NK6bTU7n385BTYae1MEN50DfoOth17S79a6oHiLq.html">NK6bTU7n385BTYae1MEN50DfoOth17S79a6oHiLq</a></li>
        <li><a href="/B7WGkUQyXm28mj175qnHkb3D3QDVS8isD7B8CYMb.html">B7WGkUQyXm28mj175qnHkb3D3QDVS8isD7B8CYMb</a></li>
        <li><a href="/D5yEz8RT6IuxMHpuVoWVVltfWyVoINctcFhdeN39.html">D5yEz8RT6IuxMHpuVoWVVltfWyVoINctcFhdeN39</a></li>
        <li><a href="/ZybSd0HFhsaTwPsex63rHMBNBXAgq47TbRaWLXqW.html">ZybSd0HFhsaTwPsex63rHMBNBXAgq47TbRaWLXqW</a></li>
        <li><a href="/3uBBsbK4UYp8caPvaaxNVq8oOJOml8u595o11IgI.html">3uBBsbK4UYp8caPvaaxNVq8oOJOml8u595o11IgI</a></li>
        <li><a href="/9q1ExHRos4VJGRSYDJJ2BJNAozU7DvkFNuWgBspd.html">9q1ExHRos4VJGRSYDJJ2BJNAozU7DvkFNuWgBspd</a></li>
        <li><a href="/ntLCXSW30HVxqd276ZIZz5tOM5rOo4qBJjFZnieG.html">ntLCXSW30HVxqd276ZIZz5tOM5rOo4qBJjFZnieG</a></li>
        <li><a href="/sUqOFM2ZwicgDMaNVylZV1PSbmQovcjG5sqoEY2h.html">sUqOFM2ZwicgDMaNVylZV1PSbmQovcjG5sqoEY2h</a></li>
        <li><a href="/TpueBz4HUsDaHoNoFQRwNvMJ0lqY7C9oQkdJSCqi.html">TpueBz4HUsDaHoNoFQRwNvMJ0lqY7C9oQkdJSCqi</a></li>
        <li><a href="/klE4SccWeUHXH10uxRB5eb4bBbt0nnDWafofK7Tl.html">klE4SccWeUHXH10uxRB5eb4bBbt0nnDWafofK7Tl</a></li>
        <li><a href="/gMySxr3TTtbOoymNhhBAWmhb9BW9hGE7Hq0BkPtr.html">gMySxr3TTtbOoymNhhBAWmhb9BW9hGE7Hq0BkPtr</a></li>
      </ul>
    </div>
    <div class="footer">
      <a href="/index.html">Home</a>
      <span>-</span>
      <a href="/index-broken.html">A broken link</a>
      <span>-</span>
      <a href="/just-broken.html">Another broken link </a>
      <span>-</span>
      <a href="https://example.org/index.html">An external link</a>
      <span>-</span>
      <a href="https://example.org/index.html?msg=hello">An external link</a>
    </div>
  </body>
</html>`;

each([
  ['http://localhost.com', '<a href="/index.html">Home</a>', ['http://localhost.com/index.html']],
  ['http://localhost.com', '<a href="http://google.com/index.html">Home</a>', []],
  ['http://localhost.com', largeHtml, [
    'http://localhost.com/index.html',
    'http://localhost.com/NK6bTU7n385BTYae1MEN50DfoOth17S79a6oHiLq.html',
    'http://localhost.com/B7WGkUQyXm28mj175qnHkb3D3QDVS8isD7B8CYMb.html',
    'http://localhost.com/D5yEz8RT6IuxMHpuVoWVVltfWyVoINctcFhdeN39.html',
    'http://localhost.com/ZybSd0HFhsaTwPsex63rHMBNBXAgq47TbRaWLXqW.html',
    'http://localhost.com/3uBBsbK4UYp8caPvaaxNVq8oOJOml8u595o11IgI.html',
    'http://localhost.com/9q1ExHRos4VJGRSYDJJ2BJNAozU7DvkFNuWgBspd.html',
    'http://localhost.com/ntLCXSW30HVxqd276ZIZz5tOM5rOo4qBJjFZnieG.html',
    'http://localhost.com/sUqOFM2ZwicgDMaNVylZV1PSbmQovcjG5sqoEY2h.html',
    'http://localhost.com/TpueBz4HUsDaHoNoFQRwNvMJ0lqY7C9oQkdJSCqi.html',
    'http://localhost.com/klE4SccWeUHXH10uxRB5eb4bBbt0nnDWafofK7Tl.html',
    'http://localhost.com/gMySxr3TTtbOoymNhhBAWmhb9BW9hGE7Hq0BkPtr.html',
    'http://localhost.com/index.html',
    'http://localhost.com/index-broken.html',
    'http://localhost.com/just-broken.html'
  ]],
]).test('parse links', (baseUrl, html, expectedLinks) => {
  expect(linkParser(baseUrl, html)).toStrictEqual(expectedLinks);
});
