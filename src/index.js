import React from 'react'
import mapValues from 'lodash/object/mapValues'
import pick from 'lodash/object/pick'
import props from './props'
import Layout from './Layout'
import Controls from './Controls'
import stringify from './stringify'


export default React.createClass({

  displayName: 'Demo',

  propTypes: {
    props: React.PropTypes.object,
    padding: React.PropTypes.bool,
    target: React.PropTypes.oneOfType([React.PropTypes.func, React.PropTypes.string]).isRequired
  },

  statics: {props},

  getDefaultProps() {
    return {
      props: {},
      padding: true
    }
  },

  getPropsValue() {
    return pick(this.props.props, x => x.type === 'value')
  },

  getPropsCallback() {
    return pick(this.props.props, x => x.type === 'callback')
  },

  getCallbacks() {
    return mapValues(this.getPropsCallback(), (x, key) => {
      return (...args) => {
        const {map, callbackType} = x
        const result = map ? stringify(map(...args)) : `(${args.map(stringify).join(', ')})`
        this.setState({logs: {
          ...this.state.logs,
          [key]: callbackType === 'logLatest' ? [result] : [result, ...this.state.logs[key]]
        }})
      }
    })
  },

  getInitialState() {
    return {
      values: mapValues(this.getPropsValue(), x => x.initialValue),
      logs: mapValues(this.getPropsCallback(), () => [])
    }
  },

  getTargetName() {
    const {target} = this.props
    return (typeof target === 'string') ? target : (target.displayName || 'Comp')
  },

  render() {
    return (
      <Layout
        padding={this.props.padding}
        component={
          <this.props.target {...this.state.values} {...this.getCallbacks()} />
        }
        controls={
          <Controls
            targetName={this.getTargetName()}
            props={this.getPropsValue()}
            values={this.state.values}
            onChange={this.hangelValuesChange}
            logs={this.state.logs} />
        }
      />

    )
  },

  hangelValuesChange(newValues) {
    this.setState({values: newValues})
  }

})
