CLI for parsing social sharing and news from sites.

```
  Usage: node index.js [options]

  Options:
    -h, --help           output usage information
    -a, --append         Append result
    -s, --social         Social retrieval
    -u, --url <link>     News url
    -r, --result <file>  Result json file
```

You can schedule it using any existing tool like `cron`

Use `-a` to update extracted info and sharing count in result file.
Use `-s` to parse social counters (longer)

Output format:

```js
[
    {
       link: 'http://bitcoinwarrior.net/2015/01/ag-holder-ends-asset-seizures/',
       text: '\n\nAG Holder Ends (Some) Asset Seizures\n\nBitcoin ...',
       sharing: { vk: 0, gplus: 1, pinterest: 0, twitter: 29, linkedin: 4 }
    }
]
```
