# Future dashboard and deposit flow

## Intended journey

1. The visitor opens our affiliate landing page.
2. The visitor selects Register or Activate and follows the referral URL.
3. Registration takes place on DmFirst.
4. After confirmed registration, a dashboard can display a deposit prompt.
5. The visitor selects Continue to deposit and follows the DmFirst recharge URL.

## Destinations

- Registration: https://www.dmfirst0.com/#/register?invitationCode=93458117528
- Deposit: https://www.dmfirst0.com/#/wallet/Recharge

Both destinations are maintained in `js/config.js`.

## Integration needed

Our page cannot observe registration completion or insert a prompt inside
DmFirst's dashboard. That requires a supported DmFirst integration. A prompt on
our own return page would require a supported return URL; confirmed registration
status would also need a trusted callback or API.

Do not treat a registration-link click or a local browser flag as confirmation
that an account has been registered or activated.

## Pending details

- DmFirst integration availability and supported registration return flow.
- Whether the prompt will appear on DmFirst's dashboard or our own return page.
- Confirmed minimum deposit, currency, and activation requirements.
- Evidence for any partner-verification or promotional claims used in copy.

The deposit prompt is disabled in the initial scaffold. Do not request payment
details on the affiliate landing page. The future prompt should describe the
amount clearly, be dismissible, and navigate only after the visitor selects
Continue to deposit.

