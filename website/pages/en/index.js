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

    const ProjectTitle = () => (
      <h2 className="projectTitle">
        {siteConfig.title}
        <small>{siteConfig.tagline}</small>
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
          <Button href={docUrl('guides/getting-started/how-to-open-private-testnet-rootchain')}>Getting Started</Button>
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
                  title: `[Basic](${siteConfig.baseUrl}${siteConfig.docsUrl}/learn/basic/tokamak-network.html)`,
                  image: "/img/index_basic.png",
                  imageLink: '/docs/learn/basic/tokamak-network',
                  // imageAlign	: 'center',
                  content: `[토카막 네트워크와 확장성 솔루션에 대한 기본 개념을 익혀보세요.](${siteConfig.baseUrl}${siteConfig.docsUrl}/learn/basic/tokamak-network.html)`,
                },
                {
                  title: `[Advanced](${siteConfig.baseUrl}${siteConfig.docsUrl}/learn/advanced/design-rationale)`,
                  image: "/img/index_advance.png",
                  imageLink: '/docs/learn/advanced/design-rationale',
                  // imageAlign	: 'center',
                  content: `[루트체인, 플라즈마EVM, 리베이스, 요청가능 컨트랙트 등 고급 개념을 익혀보세요.](${siteConfig.baseUrl}${siteConfig.docsUrl}/learn/advanced/design-rationale)`,
                  
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
