/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

const CompLibrary = require('../../core/CompLibrary.js');

const MarkdownBlock = CompLibrary.MarkdownBlock; /* Used to read markdown */
const Container = CompLibrary.Container;
const GridBlock = CompLibrary.GridBlock;

const translate = require('../../server/translate.js').translate;

class HomeSplash extends React.Component {
  render() {
    const {siteConfig, language = ''} = this.props;
    const {baseUrl, docsUrl} = siteConfig;
    const docsPart = `${docsUrl ? `${docsUrl}/` : ''}`;
    const langPart = `${language ? `${language}/` : ''}`;
    const docUrl = doc => `${baseUrl}${docsPart}${langPart}${doc}`;

    const SplashContainer = props => (
      <div className="homeContainer">
        <div className="homeSplashFade">
          <div className="wrapper homeWrapper">{props.children}</div>
        </div>
      </div>
    );

    const _title = () => {siteConfig.title};

    const ProjectTitle = () => (
      <h2 className="projectTitle">
        <translate>Tokamak Network Documents</translate>
        <small><translate>Plasma EVM Doc</translate></small>
      </h2>
    );

    const PromoSection = props => (
      <div className="section promoSection">
        <div className="promoRow">
          <div className="pluginRowBlock">{props.children}</div>
        </div>
      </div>
    );

    const Button = props => (
      <div className="pluginWrapper buttonWrapper">
        <a className="button" href={props.href} target={props.target}>
          {props.children}
        </a>
      </div>
    );

    return (
      <SplashContainer>
        <div className="inner">
          <ProjectTitle siteConfig={siteConfig} />
          <PromoSection>
          {/* <Button href={docUrl('getting-start/getting-start')}>Doc</Button> */}
          <Button href={docUrl('guides/getting-started/how-to-open-private-testnet-rootchain')}><translate>Getting Started</translate></Button>
          {/* <Button href={docUrl('getting-start/getting-start')}>Manuals</Button> */}
          </PromoSection>
        </div>
      </SplashContainer>
    );
  }
}

class Index extends React.Component {
  render() {
    const props = this.props;

    const {config: siteConfig, language = ''} = props;
    const langPart = `${language ? `${language}/` : ''}`;
    const {baseUrl} = siteConfig;

    // grid contents translations, for links.
    const basic_title = <translate>Basic</translate>;
    const basic_content = <translate>Learn basics of Tokamak Network</translate>;
    const advanced_title = <translate>Advanced</translate>;
    const advanced_content = <translate>Deep dive into Tokamak Network</translate>;

    return (
      <div>
        <HomeSplash siteConfig={siteConfig} language={language} />
        <div className="mainContainer">

          <Container
            // padding={['bottom', 'top']}
            background={props.background}
          >
            <GridBlock
              align="center"
              // layout={props.layout}
              // layout="twoColumn"
              contents={[
                {
                  title: `[${basic_title}](${siteConfig.baseUrl}${siteConfig.docsUrl}/${language}/learn/basic/tokamak-network.html)`,
                  image: "/img/index_basic.png",
                  imageLink: `/docs/${language}/learn/basic/tokamak-network`,
                  content: `[${basic_content}](${siteConfig.baseUrl}${siteConfig.docsUrl}/${language}/learn/basic/tokamak-network.html)`,
                },
                {
                  title: `[${advanced_title}](${siteConfig.baseUrl}${siteConfig.docsUrl}/${language}/learn/advanced/design-rationale)`,
                  image: "/img/index_advance.png",
                  imageLink: `/docs/${language}/learn/advanced/design-rationale`,
                  // imageAlign	: 'center',
                  content: `[${advanced_content}](${siteConfig.baseUrl}${siteConfig.docsUrl}/${language}/learn/advanced/design-rationale)`,
                  
                },
              ]}
            />
          </Container>
        </div>
      </div>
    );
  }
}

module.exports = Index;
