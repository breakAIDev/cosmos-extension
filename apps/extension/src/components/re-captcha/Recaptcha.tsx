/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { Component } from 'react';

type RecaptchaProps = {
  className: string;
  onloadCallbackName: string;
  elementID: string;
  onloadCallback?: () => void;
  verifyCallback?: (token: string) => void;
  expiredCallback?: () => void;
  render: 'onload' | 'explicit';
  sitekey: string;
  theme: 'light' | 'dark';
  type: string;
  verifyCallbackName: string;
  expiredCallbackName: string;
  size: 'invisible' | 'compact' | 'normal';
  tabindex: string;
  hl?: string;
  badge: 'bottomright' | 'bottomleft' | 'inline' | 'none';
  action?: string;
};

type RecaptchaState = {
  ready: boolean;
  widget: null;
};

const isReady = () =>
  typeof window !== 'undefined' &&
  
  typeof window.grecaptcha !== 'undefined' &&
  
  typeof window.grecaptcha.render === 'function';

export class Recaptcha extends Component<RecaptchaProps, RecaptchaState> {
  constructor(props: RecaptchaProps) {
    super(props);
    this._renderGrecaptcha = this._renderGrecaptcha.bind(this);
    this.reset = this.reset.bind(this);
    this.state = {
      ready: isReady(),
      widget: null,
    };

    
    this.readyCheck = null;

    if (!this.state.ready && typeof window !== 'undefined') {
      
      this.readyCheck = setInterval(this._updateReadyState.bind(this), 1000);
    }
  }

  componentDidMount() {
    if (this.state.ready) {
      this._renderGrecaptcha();
    }
  }

  componentDidUpdate(_: RecaptchaProps, prevState: RecaptchaState) {
    const { render, onloadCallback } = this.props;

    if (render === 'explicit' && onloadCallback && this.state.ready && !prevState.ready) {
      this._renderGrecaptcha();
    }
  }

  componentWillUnmount() {
    
    clearInterval(this.readyCheck);
  }

  reset() {
    const { ready, widget } = this.state;
    if (ready && widget !== null) {
      
      window.grecaptcha.reset(widget);
    }
  }

  execute() {
    const { ready, widget } = this.state;
    if (ready && widget !== null) {
      
      window.grecaptcha.execute(widget);
    }
  }

  _updateReadyState() {
    if (isReady()) {
      this.setState({
        ready: true,
      });

      
      clearInterval(this.readyCheck);
    }
  }

  _renderGrecaptcha() {
    this.setState({
      
      widget: window.grecaptcha.render(this.props.elementID, {
        sitekey: this.props.sitekey,
        callback: this.props.verifyCallback ? this.props.verifyCallback : undefined,
        theme: this.props.theme,
        type: this.props.type,
        size: this.props.size,
        tabindex: this.props.tabindex,
        hl: this.props.hl,
        badge: this.props.badge,
        'expired-callback': this.props.expiredCallback ? this.props.expiredCallback : undefined,
        action: this.props.action,
      }),
    });

    if (this.props.onloadCallback) {
      this.props.onloadCallback();
    }
  }

  render() {
    if (this.props.render === 'explicit' && this.props.onloadCallback) {
      return (
        <div
          id={this.props.elementID}
          data-onloadcallbackname={this.props.onloadCallbackName}
          data-verifycallbackname={this.props.verifyCallbackName}
        />
      );
    }

    return (
      <div
        id={this.props.elementID}
        className={this.props.className}
        data-sitekey={this.props.sitekey}
        data-theme={this.props.theme}
        data-type={this.props.type}
        data-size={this.props.size}
        data-badge={this.props.badge}
        data-tabindex={this.props.tabindex}
        data-action={this.props.action}
      />
    );
  }
}
