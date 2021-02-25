/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

class Footer extends React.Component {
  docUrl(doc, language) {
    const baseUrl = this.props.config.baseUrl;
    const docsUrl = this.props.config.docsUrl;
    const docsPart = `${docsUrl ? `${docsUrl}/` : ''}`;
    const langPart = `${language ? `${language}/` : ''}`;
    return `${baseUrl}${docsPart}${langPart}${doc}`;
  }

  pageUrl(doc, language) {
    const baseUrl = this.props.config.baseUrl;
    return baseUrl + (language ? `${language}/` : '') + doc;
  }

  render() {
    return (
      <footer className="nav-footer" id="footer">
        <section className="sitemap">
          <a href={this.props.config.baseUrl} className="nav-home">
            {this.props.config.footerIcon && (
              <img
                src={this.props.config.baseUrl + this.props.config.footerIcon}
                alt={this.props.config.title}
                width="66"
                height="58"
              />
            )}
          </a>
          <div>
            <h5>Docs</h5>
            <a href={this.docUrl('learn/basic/tokamak-network', this.props.language)}>
              Learn
            </a>
            <a href={this.docUrl('guides/getting-started/how-to-open-private-testnet-rootchain', this.props.language)}>
              Guides
            </a>
          </div>
          <div>
            <h5>Community</h5>
            <a href="https://discord.gg/8wSpJKz">Discord</a>
            <a href="https://t.me/tokamak_network">Telegram</a>
            <a href="https://twitter.com/ontherinfo">Twitter</a>
            <a href="https://www.facebook.com/OntherInc">Facebook</a>
          </div>
          <div>
            <h5>More</h5>
            <a href="http://blog.onther.io">Onther Blog</a>
            <a href="https://github.com/onther-tech/">Onther GitHub</a>
            {this.props.config.twitterUsername && (
              <div className="social">
                <a
                  href={`https://twitter.com/${this.props.config.twitterUsername}`}
                  className="twitter-follow-button">
                  Follow @{this.props.config.twitterUsername}
                </a>
              </div>
            )}
            {/* {this.props.config.facebookAppId && (
              <div className="social">
                <div
                  className="fb-like"
                  data-href={this.props.config.url}
                  data-colorscheme="dark"
                  data-layout="standard"
                  data-share="true"
                  data-width="225"
                  data-show-faces="false"
                />
              </div>
            )} */}
          </div>
          <div>
            <h5>Family site</h5>
            <a href="https://tokamak.network">Tokamak Network</a>
            {/* <a href="https://dao.tokamak.network">DAO Governance</a> */}
            <a href="https://staking.tokamak.network">Original Staking</a>
            <a href="https://simple.staking.tokamak.network">Simple Staking</a>
            <a href="https://staking-simulator.tokamak.network">Staking Simulator</a>
            <a href="https://price.tokamak.network">Price Dashboard</a>
            <a href="https://vesting.tokamak.network">Vesting Dashboard</a>
            <a href="https://wton-swapper.tokamak.network">TON-WTON Swapper</a>
          </div>
        </section>

        <a
          href="https://tokamak.network"
          target="_blank"
          rel="noreferrer noopener"
          className="fbOpenSource">
          <img
            src={`${this.props.config.baseUrl}img/tokamak_white.png`}
            alt="Tokamak Network"
            width="200%"
            height="200%"
          />
        </a>
        <section className="copyright">{this.props.config.copyright}</section>
      </footer>
    );
  }
}

module.exports = Footer;
