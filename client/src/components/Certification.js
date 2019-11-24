import React, { Component } from "react"
import { Link } from "react-router-dom"

import contractDefinition from "../contracts/MarriageCertificationIssuer.json"
import getWeb3 from "../utils/getWeb3"
import getContractInstance from '../utils/getContractInstance'
import { redirectRoot } from "../utils/common"
import { toHex, fromHex } from "../utils/hex"

import LineTopImg from "../images/gorgeous-line-top.png"
import LineBottomImg from "../images/gorgeous-line-bottom.png"
import CerImg from "../images/certification-stamp.png"
import FacebookImg from "../images/facebook-icon.svg"
import TwitterImg from "../images/twitter-icon.svg"
import MailImg from "../images/mail-icon.svg"

const PREFIX_NUM = 20000000

class Certification extends Component {
  state = {
    bride: '',
    groom: '',
    cerID: '0x00000',
    txHash: '0x0000000000000000000000000000000000000000',
    issuedDate: (new Date()).toLocaleDateString('en-US'),
  }

  componentDidMount = async () => {
    const params = this.props.match.params

    if (this.isSample()) {
      this.setState({ bride: fromHex(params.bride), groom: fromHex(params.groom) })
      return
    }

    try {
      const web3 = await getWeb3()
      const accounts = await web3.eth.getAccounts()
      const contract = await getContractInstance(web3, contractDefinition)

      const id = decodeCertificationID(params.id)
      const certification = await contract.methods.certifications(id).call({ from: accounts[0] })
      const receipt = await web3.eth.getTransactionReceipt(params.txHash)
      const block = await web3.eth.getBlock(receipt.blockNumber)

      this.setState({ 
        bride: fromHex(certification.bride.replace(/^0x0*/,'')),
        groom: fromHex(certification.groom.replace(/^0x0*/,'')),
        cerID: params.id,
        txHash: params.txHash,
        issuedDate: (new Date(block.timestamp * 1000)).toLocaleDateString('en-US'),
      })

    } catch (e) {
      alert(e.message, console.error(e))
    }
  }

  isSample = () => this.props.match.path === '/certification/sample/:bride/:groom/'

  render() {
    const isSample = this.isSample()
    return (
      <div className="bg-white">
        <div className="container py-5">
          <div className="cross-line text-center my-2 mx-2">
            <div className="row mt-3">
              <div className="col">
                <img className="d-block mx-auto mb-4" src={LineTopImg} alt="" width="300" height="50"/>
                { isSample ? <h3>Sample</h3> : ''}
                <h1 className="text-pink">Certificate of Marriage</h1>
              </div>
            </div>
            <div className="row">
              <div className="col-md-5">
                <p className="lead mx-4 border-line">{this.state.bride}</p>
              </div>
              <div className="col-md-2">
                <p>And</p>
              </div>
              <div className="col-md-5">
                <p className="lead mx-4 border-line">{this.state.groom}</p>
              </div>
            </div>
            <div className="row">
              <div className="col">
                <p>Were United in Marriage on <code className="border-line text-dark">{this.state.issuedDate}</code><br/>This Certification was Recored in a Smart Contract of Ethereum.</p>
              </div>
            </div>
            <div className="row mb-5">
              <div className="col-md-1"></div>
              <div className="col-md-8 text-left">
                <blockquote className="blockquote ml-2">
                  <p className="mb-0">Transaction Hash:</p>
                  <footer className="blockquote-footer break-word">{this.state.txHash}</footer>
                </blockquote>
                <blockquote className="blockquote ml-2">
                  <p className="mb-0">Certification ID:</p>
                  <footer className="blockquote-footer break-word">{this.state.cerID}</footer>
                </blockquote>
              </div>
              <div className="col-md-2">
                <img src={CerImg} alt="Responsive image" width="130" height="150"/>
              </div>
              <div className="col-md-1"></div>
            </div>
            <div className="row">
              <div className="col">
                <img className="d-block mx-auto mb-4" src={LineBottomImg} alt="" width="270" height="30"/>
              </div>
            </div>
          </div>
        </div>

        <div className="pink lighten-1">
          <div className="container">
            <div className="row text-white">
              <div className="col">
                <p className="lead my-1">Share with your partner</p>
                <nav className="mb-2">
                  <img className="mr-2" src={FacebookImg} alt="" width="30" height="30"/>
                  <img className="mr-2" src={TwitterImg} alt="" width="30" height="30"/>
                  <img className="mr-2" src={MailImg} alt="" width="30" height="30"/>
                </nav>
              </div>
            </div>
            { isSample
              ? <div className="row mb-2">
                  <div className="col">
                    <Link className="btn btn-lg btn-block btn-outline-pink" 
                      to={`/issue/${toHex(this.state.bride)}/${toHex(this.state.groom)}`}>Next</Link>
                  </div>
                </div>
              : ''
             }
          </div>
        </div>
      </div>
    )
  }
}

const decodeCertificationID = (hex) => Number(fromHex(hex.replace(/^0x/, ""))) - PREFIX_NUM - 1

export default Certification
