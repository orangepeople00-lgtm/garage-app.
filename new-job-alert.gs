/** AGB new-job alert. Google Apps Script web app (Execute as: Me, Access: Anyone).
 *  The dashboard POSTs JSON here after a NEW job is saved. Edit the lists below to add Randy/Sam later. */
var EMAIL_TO = ['orangepeople00@gmail.com'];          // full email alert
var SMS_TO   = ['7086630197@tmomail.net'];            // carrier gateways, short text (T-Mobile = @tmomail.net)
var TOKEN    = 'SET-THE-SAME-TOKEN-HERE';             // must match ALERT_TOKEN in index.html (not real security: the dashboard is public)

function doPost(e) {
  var d = {};
  try { d = JSON.parse((e && e.postData && e.postData.contents) || '{}'); } catch (err) { return out_('bad json'); }
  if (!TOKEN || d.token !== TOKEN) return out_('bad token');
  var price = Number(d.price) || 0;
  var priceTxt = price ? '$' + price.toLocaleString('en-US') : '$?';
  var sms = ('New job: ' + [d.customer, d.address, d.size, d.salesman].map(clean_).filter(String).join(', ') + ', ' + priceTxt).slice(0, 159);
  var subject = 'New AGB job: ' + clean_(d.customer) + (d.salesman ? ' (' + clean_(d.salesman) + ')' : '');
  var body = ['New job saved on the AGB dashboard.', '',
    'Customer: ' + clean_(d.customer), 'Address: ' + clean_(d.address), 'Garage size: ' + clean_(d.size),
    'Salesman: ' + clean_(d.salesman), 'Price: ' + priceTxt, 'Sold date: ' + clean_(d.sold_date),
    'Entered by: ' + clean_(d.by), 'Source: ' + clean_(d.source)].join('\n');
  EMAIL_TO.forEach(function (to) { if (to) MailApp.sendEmail(to, subject, body); });
  SMS_TO.forEach(function (to) { if (to) MailApp.sendEmail(to, '', sms); });
  return out_('ok');
}
function doGet() { return out_('AGB alert web app is running.'); }
function testAlert() { doPost({postData: {contents: JSON.stringify({token: TOKEN, customer: 'Test Customer', address: '123 Oak St, Chicago', size: '24x24', salesman: 'Sam', price: 30000, source: 'test'})}}); }
function clean_(s) { return String(s == null ? '' : s).replace(/[\r\n]+/g, ' ').trim(); }
function out_(t) { return ContentService.createTextOutput(t); }
