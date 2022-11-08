# github-visitors-counter-action
An action to accumulate the number of visitors who have viewed the public repositories. It uses the [Traffic API](https://docs.github.com/en/rest/metrics/traffic#about-the-repository-traffic-api) to fetch the number of visitors.

## Use the action
The [personal access token](https://github.com/settings/tokens) is required to get the action work and `public_repo` is the only required permission. When the token is generated, that needs to be put under the `Actions secrets` with a dedicated name (e.g. PAT_TOKEN_PUBLIC as the follow one).

The action will change the structure of the repository, so it is good to use a new repository to record views. Check the [example](https://github.com/taurusni/View-Counter) if you wish.

If `excluded-list` is not used to exclude some repositories you don't want to count, all public repositories will be considered.

```
name: View Update Action
on:
  schedule:
    - cron: '0 */24 * * *'
  workflow_dispatch:

jobs:
  update:
    name: Update Count and Uniques
    runs-on: ubuntu-latest
    steps:
      - name: Get the resources
        uses: actions/checkout@v3
      - name: Call the github-visitors-counter-action
        uses: taurusni/github-visitors-counter-action@v1
        with:
          repo-token: ${{ secrets.PAT_TOKEN_PUBLIC  }}
          excluded-list: |
            <repo1>
            <repo2>
```

# Reference
* [Creating a JavaScript action](https://docs.github.com/en/actions/creating-actions/creating-a-javascript-action)
* [GITHUB_TOKEN](https://docs.github.com/en/actions/security-guides/automatic-token-authentication#permissions-for-the-github_token)
  * [GITHUN_TOKEN permission](https://docs.github.com/en/actions/using-jobs/assigning-permissions-to-jobs)
  * [PAT](https://docs.github.com/en/rest/overview/permissions-required-for-fine-grained-personal-access-tokens)
* [API](https://docs.github.com/en/rest/guides/getting-started-with-the-rest-api)
  * [Traffic API](https://docs.github.com/en/rest/metrics/traffic#about-the-repository-traffic-api)
* [workflow-trigger](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#workflow_dispatch)
* [fs-extra](https://www.npmjs.com/package/fs-extra)
