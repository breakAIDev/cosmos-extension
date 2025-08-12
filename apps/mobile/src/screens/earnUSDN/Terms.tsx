import { Header, HeaderActionType } from '@leapwallet/leap-ui';
import PopupLayout from '../../components/layout/popup-layout';
import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  Linking,
  Platform,
} from 'react-native';

const termsLinks = {
  nobleTerms: 'https://dollar.noble.xyz/terms-of-use',
  nobleSite: 'https://dollar.noble.xyz/dollar.noble.xyz',
  ofac: 'http://www.treas.gov/ofac',
  jamsStreamlined: 'http://www.jamsadr.com/rules-streamlined-arbitration/',
  jamsComprehensive: 'http://www.jamsadr.com/rules-comprehensive-arbitration/',
  jams: 'https://www.jamsadr.com',
  jamsPhone: 'tel:800-352-5267',
  nasdEmail: 'mailto:legal@nobleassets.xyz',
  californiaPhone: 'tel:800-952-5210',
};

const openLink = async (url: string) => {
  if (await Linking.canOpenURL(url)) {
    Linking.openURL(url);
  }
};

const openMail = () => Linking.openURL('mailto:legal@nobleassets.xyz');

const openJamsStreamlined = () =>
  Linking.openURL('http://www.jamsadr.com/rules-streamlined-arbitration/');

const openJamsComprehensive = () =>
  Linking.openURL('http://www.jamsadr.com/rules-comprehensive-arbitration/');

const openJams = () => Linking.openURL('https://dollar.noble.xyz/www.jamsadr.com');

const callJams = () => Linking.openURL('tel:800-352-5267');

const Link = ({ url, children }: { url: string, children: string }) => (
  <TouchableOpacity onPress={() => openLink(url)}>
    <Text style={styles.link}>{children}</Text>
  </TouchableOpacity>
);

const Terms = ({ onBack, onAgree }: { onBack: () => void; onAgree: () => void }) => {
  return (
    <View style={styles.root}>
      <PopupLayout
        header={
          <Header
            title="Terms of Use"
            action={{
              type: HeaderActionType.BACK,
              onClick: onBack,
            }}
          />
        }
      >
        <View style={styles.contentWrapper}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
          >
            <Text style={styles.p}>
              <Text style={styles.bold}>Note</Text>: This product is provided by Noble (NASD, Inc.), not Leap Wallet.
              The terms below are reproduced for your convenience from{' '}
              <Text
                style={styles.link}
                onPress={() => openLink(termsLinks.nobleTerms)}
              >
                Noble’s official Terms of Use
              </Text>
              . By continuing, you agree to Noble’s terms.
            </Text>

            <Text style={styles.h2}>Last revised on: February 26, 2025</Text>

            <Text style={styles.p}>
              The service located at{' '}
              <Text
                style={styles.link}
                onPress={() => openLink(termsLinks.nobleSite)}
              >
                dollar.noble.xyz
              </Text>{' '}
              and all related websites, subdomains and applications (including mobile apps) (collectively, the{' '}
              <Text style={styles.bold}>Site</Text>
              ) is a copyrighted work belonging to NASD, Inc. (
              <Text style={styles.bold}>NASD</Text>
              , <Text style={styles.bold}>us</Text>, <Text style={styles.bold}>our</Text>, and{' '}
              <Text style={styles.bold}>we</Text>
              ). Certain features of the Site may be subject to additional guidelines, terms, or rules, which will be
              posted on the Site in connection with such features. All such additional terms, guidelines, and rules are
              incorporated by reference into these Terms.
            </Text>

            <Text style={styles.p}>
              These Terms of Use (“
              <Text style={styles.bold}>Terms</Text>
              ”), TOGETHER WITH ANY APPLICABLE SUPPLEMENTAL TERMS (COLLECTIVELY, “
              <Text style={styles.bold}>AGREEMENT</Text>
              ”), set forth the legally binding terms and conditions that govern your use of the Site. THIS AGREEMENT GOVERNS THE USE OF THE SITE AND ANY OF THE SERVICES, TECHNOLOGY AND RESOURCES AVAILABLE OR ENABLED THROUGH THE SITE (EACH A “
              <Text style={styles.bold}>SERVICE</Text>
              ” and COLLECTIVELY, THE “
              <Text style={styles.bold}>Services</Text>
              ”) AND APPLY TO ALL INTERNET USERS VISITING, ACCESSING, OR USING THE SERVICES. By accessing or using the SERVICES, you are accepting THIS AGREEMENT (on behalf of yourself or the entity that you represent), and you represent and warrant that you have the right, authority, and capacity to enter into THIS AGREEMENT (on behalf of yourself or the entity that you represent). You may not access or use the SERVICES or accept THIS AGREEMENT if you are not at least EIGHTEEN (18) years old. If you do not agree with all of the provisions of THIS AGREEMENT, do not access and/or use the SERVICES.
            </Text>

            <Text style={styles.p}>
              <Text style={styles.bold}>
                NASD IS NOT A BROKER, FINANCIAL INSTITUTION, FINANCIAL ADVISOR, INVESTMENT ADVISOR, OR INTERMEDIARY AND
                IS IN NO WAY YOUR AGENT, ADVISOR, OR CUSTODIAN. NASD CANNOT INITIATE A TRANSFER OF ANY OF YOUR
                CRYPTOCURRENCY OR DIGITAL ASSETS OR OTHERWISE ACCESS YOUR DIGITAL ASSETS. NASD HAS NO FIDUCIARY
                RELATIONSHIP OR OBLIGATION TO YOU REGARDING ANY DECISIONS OR ACTIVITIES THAT YOU EFFECT IN CONNECTION
                WITH YOUR USE OF THE SERVICES. WE DO NOT PARTICIPATE IN ANY TRANSACTIONS ON THIRD-PARTY PROTOCOLS, AND
                DO NOT RECOMMEND, ENDORSE, OR OTHERWISE TAKE A POSITION ON YOUR USE OF THESE SERVICES.
              </Text>
            </Text>

            <Text style={styles.p}>
              <Text style={styles.bold}>
                NASD IS NOT CAPABLE OF PERFORMING TRANSACTIONS OR SENDING TRANSACTION MESSAGES ON YOUR BEHALF. ALL
                TRANSACTIONS INITIATED THROUGH OUR SERVICES ARE INITIATED BY YOU THROUGH YOUR WALLET AND COMPLETED
                THROUGH THE APPLICABLE THIRD-PARTY SERVICE.
              </Text>
            </Text>

            <Text style={styles.p}>
              <Text style={styles.bold}>
                PLEASE BE AWARE THAT SECTION 12.2 CONTAINS PROVISIONS GOVERNING HOW TO RESOLVE DISPUTES BETWEEN YOU AND
                NASD. AMONG OTHER THINGS, SECTION 12.2 INCLUDES AN AGREEMENT TO ARBITRATE WHICH REQUIRES, WITH LIMITED
                EXCEPTIONS, THAT ALL DISPUTES BETWEEN YOU AND US SHALL BE RESOLVED BY BINDING AND FINAL ARBITRATION.
                SECTION 12.2 ALSO CONTAINS A CLASS ACTION AND JURY TRIAL WAIVER. PLEASE READ SECTION 12.2 CAREFULLY.
              </Text>
            </Text>

            <Text style={styles.p}>
              <Text style={styles.bold}>
                UNLESS YOU OPT OUT OF THE AGREEMENT TO ARBITRATE WITHIN THIRTY (30) DAYS: (a) YOU WILL ONLY BE PERMITTED
                TO PURSUE DISPUTES OR CLAIMS AND SEEK RELIEF AGAINST US ON AN INDIVIDUAL BASIS, NOT AS A PLAINTIFF OR
                CLASS MEMBER IN ANY CLASS OR REPRESENTATIVE ACTION OR PROCEEDING AND YOU WAIVE YOUR RIGHT TO PARTICIPATE
                IN A CLASS ACTION LAWSUIT OR CLASS-WIDE ARBITRATION; AND (b) YOU ARE WAIVING YOUR RIGHT TO PURSUE
                DISPUTES OR CLAIMS AND SEEK RELIEF IN A COURT OF LAW AND TO HAVE A JURY TRIAL.
              </Text>
            </Text>

            <Text style={styles.p}>
              Your use of, and participation in, certain Services may be subject to Supplemental Terms (defined below),
              which will either be listed in these Terms or will be presented to you for your acceptance when you sign
              up to use the supplemental Service. If these Terms are inconsistent with the Supplemental Terms, the
              Supplemental Terms shall control with respect to such Service.
            </Text>

            <Text style={styles.p}>
              PLEASE NOTE THAT THESE TERMS ARE SUBJECT TO CHANGE BY NASD IN ITS SOLE DISCRETION AT ANY TIME. When
              changes are made, NASD will make a new copy of these Terms available within the Services and any new
              Supplemental Terms will be made available from within, or through, the affected Service. We will also
              update the “Last Updated” date at the top of these Terms. Any changes to these Terms will be
              effective immediately for new users of the Site and/or Services and will be effective thirty (30) days
              after posting notice of such changes on the Site and/or Services for existing users of the Services. NASD
              may require you to provide consent to the updated Agreement in a specified manner before further use of
              the Site and/or the Services is permitted. If you do not agree to any change(s) after receiving a notice
              of such change(s), you shall stop using the Site and/or the Services. Otherwise, your continued use of the
              Site and/or Services constitutes your acceptance of such change(s). PLEASE REGULARLY CHECK THE SERVICES TO
              VIEW THE THEN-CURRENT TERMS.
            </Text>

            <View style={styles.ol}>
              <View style={styles.li}>
                <Text style={styles.p}>
                  Description of the Services. The Services include the Site and the Services enabled thereby, as
                  further defined and described below. There are important risks and limitations associated with the use
                  of the Services as described below and elsewhere in this Agreement. Please read them carefully.
                </Text>
                <View style={styles.ol}>
                  {/* 1. The Services */}
                  <View style={styles.li}>
                    <Text style={styles.p}>
                      <Text style={styles.bold}>The Services.</Text> NASD's Services include an online platform that allows
                      users to connect compatible third-party digital asset wallets ("Wallets") to the Services, view and interact
                      with certain approved digital assets ("User Assets") in their Wallet. The Services may assist users in drafting
                      transaction messages that would swap certain User Assets on one blockchain in exchange for digital assets on a
                      different blockchain through a Third-Party Service (defined below). For the avoidance of doubt, users of the
                      Services, and not NASD, control the Private Key (defined below) with respect to each such Wallet that initiates
                      and executes all such transactions. User Assets may be displayed on the Services based on predetermined
                      algorithms and other metrics developed or designed by us. NASD may change the Services or add additional
                      functionality from time to time.
                    </Text>
                  </View>
                  {/* 2. User Asset Information */}
                  <View style={styles.li}>
                    <Text style={styles.p}>
                      <Text style={styles.bold}>User Asset Information.</Text> Users can use the Services (a) to aggregate and display
                      publicly available information related to any User Assets; and (b) to draft transaction messages which the user
                      can independently use in conjunction with a Wallet to purchase and/or sell User Assets. User Asset
                      visualizations may include graphs, projections, and other information about your User Assets (collectively,
                      "User Asset Information"). Information that may be provided to you by the Services about your allocation of your
                      User Assets is considered User Asset Information. You acknowledge that User Asset Information is provided by
                      Third-Party Services and NASD is not liable for any losses arising out of, related to or based on your use of or
                      reliance on User Asset Information. We encourage you to independently verify all User Asset Information.
                    </Text>
                  </View>
                  {/* 3. Your User Assets */}
                  <View style={styles.li}>
                    <Text style={styles.p}>
                      <Text style={styles.bold}>Your User Assets.</Text> When you use the Services to transfer, exchange, buy, or sell
                      User Assets, you represent and warrant that (a) you own or have the authority to connect the Wallet(s)
                      containing such User Assets; (b) you own or have the authority to transfer such User Assets; (c) all User Assets
                      you transfer or otherwise make available in connection with the Services have been earned, received, or
                      otherwise acquired by you in compliance with all applicable laws; and (d) no User Assets that you transfer or
                      otherwise make available in connection with the Services have been "tumbled" or otherwise undergone any process
                      designed to hide, mask, or obscure the origin or ownership of such User Assets.
                    </Text>
                  </View>
                  {/* 4. Transfers of User Assets */}
                  <View style={styles.li}>
                    <Text style={styles.p}>
                      <Text style={styles.bold}>Transfers of User Assets.</Text> By combining publicly available information with your
                      interactions with the Services, the Services can draft standard transaction messages that are designed to
                      accomplish your operational goals as expressed through the interactions with the Services. You may seek to
                      broadcast such messages to the applicable software-based Third-Party Service that facilitates the purchase,
                      transfer, or exchange of User Assets (each, a "Third-Party Protocol") or validator network for any supported
                      blockchain in order to initiate a transaction involving User Assets. All draft transaction messages are designed
                      to be delivered by the Services via API to a Wallet selected by you. You must personally review and authorize
                      all transaction messages that you wish to execute; this requires you to sign the relevant transaction message
                      with your Private Key, which is inaccessible to the Services or NASD. The authorized message will then be
                      broadcast to validators through the Wallet and, as applicable to a particular transaction, you may be required
                      to pay Third-Party Fees (defined below) to have the validators record the results of the transaction message on
                      the applicable blockchain, resulting in a transfer of User Assets. NASD and the Services are not your agents or
                      intermediaries, do not store or have access to or control over any Third-Party Protocol or other Third-Party
                      Service, User Assets, private keys, passwords, accounts or other property of yours, and are not capable of
                      performing transactions or sending transaction messages on your behalf. All transactions through Third-Party
                      Protocols are effected between you and the applicable Third-Party Protocol, and NASD shall have no liability in
                      connection with same.
                    </Text>
                  </View>
                  {/* 5. Registration */}
                  <View style={styles.li}>
                    <Text style={styles.p}>
                      <Text style={styles.bold}>Registration.</Text>
                    </Text>
                    <View style={styles.ol}>
                      {/* 5.1 Registering Your Account */}
                      <View style={styles.li}>
                        <Text style={styles.p}>
                          <Text style={styles.bold}>Registering Your Account.</Text> In order to access certain features of the
                          Services, you may be required to register an account on the Services ("Account"), connect a Wallet to the
                          Services, and/or create a Wallet through a Third-Party Service. You acknowledge and agree that our
                          obligation to provide you with any Services is conditioned on the Registration Data (defined below) being
                          accurate and complete at all times during the term of this Agreement. You agree not to use the Services if
                          you have been previously removed by NASD, or if you have been previously banned from any of the Services.
                          NASD reserves the right to obtain and retain any Registration Data or other identifying information it as it
                          may determine from time to time in order for you to use and continue to use the Services.
                        </Text>
                      </View>
                      {/* 5.2 Registration Data */}
                      <View style={styles.li}>
                        <Text style={styles.p}>
                          <Text style={styles.bold}>Registration Data.</Text> In registering an Account on the Services, you shall (i)
                          provide true, accurate, current, and complete information about yourself as prompted by the registration
                          form (the "<Text style={styles.bold}>Registration Data</Text>"), and (ii) maintain and promptly update the
                          Registration Data to keep it true, accurate, current, and complete.
                        </Text>
                      </View>
                      {/* 5.3 Your Account */}
                      <View style={styles.li}>
                        <Text style={styles.p}>
                          <Text style={styles.bold}>Your Account.</Text> Notwithstanding anything to the contrary herein, you
                          acknowledge and agree that you have no ownership or other property interest in your Account, and you further
                          acknowledge and agree that all rights in and to your Account are and will forever be owned by and inure to
                          the benefit of NASD. Furthermore, you are responsible for all activities that occur under your Account. You
                          shall monitor your Account to restrict use by minors, and you will accept full responsibility for any
                          unauthorized use of the Services by minors. You may not share your Account or password with anyone, and you
                          agree to notify NASD immediately of any unauthorized use of your password or any other breach of security.
                          If you provide any Registration Data or other information that is untrue, inaccurate, incomplete or not
                          current, or NASD has reasonable grounds to suspect that any information you provide is untrue, inaccurate,
                          incomplete or not current, NASD has the right to suspend or terminate your Account and refuse any and all
                          current or future use of the Services (or any portion thereof). You agree not to create an Account using a
                          false identity or information, or on behalf of someone other than yourself. You agree not to create an
                          Account or use the Services if you have been previously removed by NASD, or if you have been previously
                          banned from any of the Services.
                        </Text>
                      </View>
                      {/* 5.4 Representations */}
                      <View style={styles.li}>
                        <Text style={styles.p}>
                          <Text style={styles.bold}>Representations.</Text> You represent and warrant that:
                        </Text>
                        <View style={styles.ol}>
                          {/* 5.4.1 */}
                          <View style={styles.li}>
                            <Text style={styles.p}>
                              You are (1) at least eighteen (18) years old; (2) of legal age to form a binding contract; and (3) not
                              a person barred from using Services under the laws of the United States, your place of residence or any
                              other applicable jurisdiction. If you are acting on behalf of a DAO or other entity, whether or not such
                              entity is formally incorporated under the laws of your jurisdiction, you represent and warrant that you
                              have all right and authority necessary to act on behalf of such entity.
                            </Text>
                          </View>
                          {/* 5.4.2 with Link */}
                          <View style={styles.li}>
                            <Text style={styles.p}>
                              None of: (1) you; (2) any affiliate of any entity on behalf of which you are entering into this
                              Agreement; (3) any other person having a beneficial interest in any entity on behalf of which you are
                              entering into this Agreement (or in any affiliate thereof); or (4) any person for whom you are acting as
                              agent or nominee in connection with this Agreement is: (A) a country, territory, entity or individual
                              named on an OFAC list as provided at{' '}
                              <Link url="http://www.treas.gov/ofac">http://www.treas.gov/ofac</Link>
                              , or any person or entity prohibited under the OFAC programs, regardless of whether or not they appear
                              on the OFAC list; or (B) a senior foreign political figure, or any immediate family member or close
                              associate of a senior foreign political figure. There is no legal proceeding pending that relates to
                              your activities relating to buying, selling, staking, or otherwise using cryptocurrency or any other
                              token- or digital asset- trading or blockchain technology related activities;
                            </Text>
                          </View>
                          {/* 5.4.3 */}
                          <View style={styles.li}>
                            <Text style={styles.p}>
                              You have not failed to comply with, and have not violated, any applicable legal requirement relating to
                              any blockchain technologies, User Assets, or token-trading activities or any other applicable laws,
                              including, but not limited to, anti-money laundering or terrorist financing laws, and no investigation
                              or review by any governmental entity is pending or, to your knowledge, has been threatened against or
                              with respect to you, nor does any government order or action prohibit you or any of your representatives
                              from engaging in or continuing any conduct, activity or practice relating to cryptocurrency.
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
                  {/* 6. Staking Rewards */}
                  <View style={styles.li}>
                    <Text style={styles.p}>
                      <Text style={styles.bold}>Staking Rewards.</Text> Certain Third-Party Protocols may offer or provide User Asset
                      rewards, including generated yield ("Staking Rewards"). NO STAKING REWARDS ARE PROVIDED BY NASD. Any Staking
                      Rewards will be at the sole discretion of the applicable Third-Party Protocol, and NASD has no obligation to
                      facilitate any Staking Rewards payment or any liability in connection with any Staking Rewards or any failure to
                      receive the same. NASD does not guarantee any Staking Rewards or any other rewards on or in connection with your
                      User Assets.
                    </Text>
                  </View>
                  {/* 7. Wallets */}
                  <View style={styles.li}>
                    <Text style={styles.p}>
                      <Text style={styles.bold}>Wallets.</Text> In connection with certain features of the Services you will need to
                      create and/or connect a Wallet owned or controlled by you. Access to and use of a Wallet is subject to
                      additional terms and conditions between you and the provider of such Wallet. Please note that if a Wallet or
                      associated Service becomes unavailable then you should not attempt to use such Wallet in connection with the
                      Services, and we disclaim all liability in connection with the foregoing, including without limitation any
                      inability to access any User Assets you have sent to or stored in such Wallet. PLEASE NOTE THAT YOUR
                      RELATIONSHIP WITH ANY THIRD-PARTY SERVICE PROVIDERS ASSOCIATED WITH YOUR WALLET IS GOVERNED SOLELY BY YOUR
                      AGREEMENT(S) WITH SUCH THIRD-PARTY SERVICE PROVIDERS, AND NASD DISCLAIMS ANY LIABILITY FOR INFORMATION THAT MAY
                      BE PROVIDED TO IT OR USER ASSETS THAT MAY BE TRANSFERRED VIA THE PROTOCOL BY OR THROUGH SUCH THIRD-PARTY SERVICE
                      PROVIDERS. Access to your Wallet may require the use of a private key, passphrase, or Third-Party Service
                      ("Private Key") and NASD has no ability to access your Wallet without your involvement and authority. Your
                      Private Key is unique to you and shall be maintained by you. If you lose your Private Key, you may lose access
                      to your Wallet and any contents thereof, unless otherwise set forth in the agreement between you and the
                      provider of the applicable Wallet. NASD does not have the ability to recover a lost Private Key. While a Wallet
                      may be interoperable with other compatible blockchain platforms, tokens, or services, only User Assets supported
                      by NASD that are stored in your Wallet will be accessible through the Services.
                    </Text>
                  </View>
                  {/* 8. Supplemental Terms */}
                  <View style={styles.li}>
                    <Text style={styles.p}>
                      <Text style={styles.bold}>Supplemental Terms.</Text> Your use of, and participation in, certain features and
                      functionality of the Services may be subject to additional terms ("Supplemental Terms"). Such Supplemental Terms
                      will either be set forth in the applicable supplemental Services or will be presented to you for your acceptance
                      when you sign up to use the supplemental Services. If these Terms are inconsistent with the Supplemental Terms,
                      then the Supplemental Terms control with respect to such supplemental Service.
                    </Text>
                  </View>
                  {/* 9. Necessary Equipment and Software */}
                  <View style={styles.li}>
                    <Text style={styles.p}>
                      <Text style={styles.bold}>Necessary Equipment and Software.</Text> You must provide all equipment, software, and
                      hardware necessary to connect to the Services. You are solely responsible for any fees, including Internet
                      connection or mobile fees, that you incur when accessing the Services. You are solely responsible for keeping
                      your hardware devices secure. NASD will not be responsible if someone else accesses your devices and authorizes
                      a transaction upon receipt of a valid transfer initiated from the Services.
                    </Text>
                  </View>
                  {/* 10. Points Program */}
                  <View style={styles.li}>
                    <Text style={styles.p}>
                      <Text style={styles.bold}>Points Program.</Text> Subject to your ongoing compliance with this Agreement and any
                      Points Program Terms (defined below) made available by NASD from time to time, NASD may enable you to
                      participate in a limited program that rewards users for interacting with the Service ("Points Program") by
                      allocating such users with digital assets that bear no cash or monetary value and are made available by NASD
                      ("Points," as further described below). Your participation in any Points Program constitutes your acceptance of
                      the then-current terms and conditions applicable thereto at the time of such participation ("Points Program
                      Terms"), as may be modified or updated by NASD in its sole discretion. Additional terms applicable to the Points
                      Program, which shall constitute part of the Points Program Terms, may be set forth on the Service from time to
                      time.
                    </Text>
                    {/* Points Program nested list */}
                    <View style={styles.ol}>
                      {/* 10.1 Points */}
                      <View style={styles.li}>
                        <Text style={styles.p}>
                          <Text style={styles.bold}>Points.</Text> Points will be allocated in accordance with the then-current Points
                          Program Terms and any applicable Supplemental Terms. NASD does not guarantee that you will receive or be
                          eligible to receive any minimum amount of Points by participating in the Points Program. Points have no
                          monetary value and cannot be redeemed for cash or cash equivalent, including any cryptocurrency.
                          Accumulating Points does not entitle you to any vested rights, and NASD does not guarantee in any way the
                          continued availability of Points. POINTS HAVE NO CASH VALUE. POINTS ARE MADE AVAILABLE "AS IS" AND WITHOUT
                          WARRANTY OF ANY KIND.
                        </Text>
                      </View>
                      {/* 10.2 Taxes */}
                      <View style={styles.li}>
                        <Text style={styles.p}>
                          <Text style={styles.bold}>Taxes.</Text> In the event that any applicable authority determines that your
                          receipt of Points is a taxable event, you agree that you, and not NASD, are solely liable for payment of
                          such taxes, and you agree to indemnify NASD in connection with same.
                        </Text>
                      </View>
                      {/* 10.3 Disclaimers */}
                      <View style={styles.li}>
                        <Text style={styles.p}>
                          <Text style={styles.bold}>Disclaimers.</Text> Points are provided solely as an optional enhancement to users
                          to incentivize participation in the Service. Points do not constitute compensation or any other form of
                          consideration for services. You agree that Points may be cancelled or revoked by NASD at any time, including
                          if you breach this Agreement; misuse or abuse the Points Program; or commit or participate in any fraudulent
                          activity related to the Points Program. NASD RESERVES THE RIGHT TO MODIFY OR TERMINATE THE POINTS PROGRAM AT
                          ANY TIME, FOR ANY OR FOR NO REASON, WITH OR WITHOUT NOTICE TO YOU. In the event of any termination, all
                          Points will expire immediately as of the effective date of termination.
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
              <View style={styles.li}>
                <Text style={[styles.p, styles.bold]}>Your Assumption of Risk</Text>
                <View style={styles.ol}>
                  {/* 1 */}
                  <View style={styles.li}>
                    <Text style={styles.p}>
                      When you use the Services, you understand and acknowledge that NASD is not a financial OR INVESTMENT advisor and that the Services ENTAIL A RISK OF LOSS AND may not meet your needs. NASD may not be able to foresee or anticipate technical or other difficulties which may result in data loss or other service interruptions. NASD encourages you to periodically confirm the valuation of your User Assets. NASD does not and cannot make any guarantee that your User Assets will not lose value. The prices of cryptocurrency assets can be extremely volatile. NASD makes no warranties as to the markets in which your User Assets are staked, transferred, purchased, or traded.
                    </Text>
                  </View>
                  {/* 2 */}
                  <View style={styles.li}>
                    <Text style={styles.p}>
                      You understand that like any other software, the Services could be at risk of third-party malware, hacks, or cybersecurity breaches. You agree that it is your responsibility to monitor your User Assets regularly and confirm their proper use and deployment consistent with your intentions.
                    </Text>
                  </View>
                  {/* 3 */}
                  <View style={styles.li}>
                    <Text style={styles.p}>
                      NASD has no control over any blockchain and therefore cannot and does not ensure that any transaction details that you submit or receive via our Services will be validated by or confirmed on the relevant blockchain, and NASD does not have the ability to facilitate any cancellation or modification requests. You accept and acknowledge that you take full responsibility for all activities that you effect through the Services and accept all risks of loss, to the maximum extent permitted by law. You further accept and acknowledge that:
                    </Text>
                    <View style={styles.ol}>
                      {/* 3.1 */}
                      <View style={styles.li}>
                        <Text style={styles.p}>
                          You represent and warrant that you (i) have the necessary technical expertise and ability to review and evaluate the security, integrity, and operation of your Wallets and any blockchains to which your User Assets may be deployed or transferred in connection with the Services; (ii) have the knowledge, experience, understanding, professional advice, and information to make your own evaluation of the merits, risks, and applicable compliance requirements under applicable laws of any use of any blockchains to which your User Assets may be deployed in connection with the Services; (iii) know, understand, and accept the risks associated with any blockchains to which your User Assets may be deployed in connection with the Services; and (iv) accept the risks associated with blockchain technology generally, and are responsible for conducting your own independent analysis of the risks specific to your use of the Services. You further agree that NASD will have no responsibility or liability for such risks.
                        </Text>
                      </View>
                      {/* 3.2 */}
                      <View style={styles.li}>
                        <Text style={styles.p}>
                          There are risks associated with using digital assets, including but not limited to, the risk of hardware, software, and Internet connections; the risk of malicious software introduction; the risk that third parties may obtain unauthorized access to information stored within your Wallets; the risks of counterfeit assets, mislabeled assets, assets that are vulnerable to metadata decay, assets on smart contracts with bugs, and assets that may become untransferable; and the risk that such digital assets may fluctuate in value. You accept and acknowledge that NASD will not be responsible for any communication failures, disruptions, errors, distortions, delays, or losses you may experience when using blockchain technology, however caused.
                        </Text>
                      </View>
                      {/* 3.3 */}
                      <View style={styles.li}>
                        <Text style={styles.p}>
                          The regulatory regimes governing blockchain technologies, cryptocurrencies, and tokens are uncertain, and new regulations or policies, or new or different interpretations of existing regulations, may materially adversely affect the development of the Services and the value of your User Assets.
                        </Text>
                      </View>
                      {/* 3.4 */}
                      <View style={styles.li}>
                        <Text style={styles.p}>
                          NASD makes no guarantee as to the functionality of any blockchain's decentralized governance, which could, among other things, lead to delays, conflicts of interest, or operational decisions that are unfavorable to your User Assets. You acknowledge and accept that the protocols governing the operation of a blockchain may be subject to sudden changes in operating rules which may materially alter the blockchain and affect the value and function of User Assets supported by that blockchain.
                        </Text>
                      </View>
                      {/* 3.5 */}
                      <View style={styles.li}>
                        <Text style={styles.p}>
                          NASD makes no guarantee as to the security of any blockchain or Wallet. NASD is not liable for any hacks, double spending, or any other attacks on any blockchain or your Wallet.
                        </Text>
                      </View>
                      {/* 3.6 */}
                      <View style={styles.li}>
                        <Text style={styles.p}>
                          Any blockchain may slash or otherwise impose penalties on certain validators (including validators to which your User Assets have been deployed) in response to any activity not condoned by such blockchain. You acknowledge and agree that NASD shall have no liability in connection with any such slashing or penalties, including any slashing or penalties that result in a loss or depreciation of value of your User Assets.
                        </Text>
                      </View>
                      {/* 3.7 */}
                      <View style={styles.li}>
                        <Text style={styles.p}>
                          Any blockchain supported by the Services is controlled by third parties, and NASD is not responsible for their performance nor any risks associated with the use thereof. The Services rely on, and NASD makes no guarantee or warranties as to the functionality of or access to any blockchain.
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
              <View style={styles.li}>
                <Text style={[styles.p, styles.bold]}>License to the Services</Text>
                <View style={styles.ol}>
                  {/* License to Services */}
                  <View style={styles.li}>
                    <Text style={styles.p}>
                      <Text style={styles.bold}>License to Services. </Text>
                      Subject to this Agreement, NASD grants you a non-transferable, non-exclusive, revocable, limited license to use and access and use the Services solely for your own personal, noncommercial use.
                    </Text>
                  </View>
                  {/* Certain Restrictions */}
                  <View style={styles.li}>
                    <Text style={styles.p}>
                      <Text style={styles.bold}>Certain Restrictions. </Text>
                      The rights granted to you in this Agreement are subject to the following restrictions: (a) you shall not license, sell, rent, lease, transfer, assign, distribute, host, or otherwise commercially exploit the Site or any Service, whether in whole or in part, or any content displayed on the Site or any Service; (b) you shall not modify, make derivative works of, disassemble, reverse compile, or reverse engineer any part of the Site or any Service; (c) you shall not access the Site or any Services in order to build a similar or competitive website, product, or service; and (d) except as expressly stated herein, no part of the Site or any Services may be copied, reproduced, distributed, republished, downloaded, displayed, posted, or transmitted in any form or by any means. Unless otherwise indicated, any future release, update, or other addition to functionality of the Site or any Services shall be subject to this Agreement. All copyright and other proprietary notices on the Site (or on any content displayed on the Site) must be retained on all copies thereof.
                    </Text>
                  </View>
                  {/* Modification */}
                  <View style={styles.li}>
                    <Text style={styles.p}>
                      <Text style={styles.bold}>Modification. </Text>
                      NASD reserves the right, at any time, to update, modify, suspend, or discontinue the Services (in whole or in part) with or without notice to you. You agree that NASD will not be liable to you or to any third party for any modification, suspension, or discontinuation of the Service or any part thereof. You may need to update third-party software from time to time in order to use the Services.
                    </Text>
                  </View>
                  {/* No Support or Maintenance */}
                  <View style={styles.li}>
                    <Text style={styles.p}>
                      <Text style={styles.bold}>No Support or Maintenance. </Text>
                      You acknowledge and agree that NASD will have no obligation to provide you with any support or maintenance in connection with the Services.
                    </Text>
                  </View>
                  {/* Ownership */}
                  <View style={styles.li}>
                    <Text style={styles.p}>
                      <Text style={styles.bold}>Ownership. </Text>
                      You acknowledge that all the intellectual property rights, including copyrights, patents, trademarks, and trade secrets, in the Site and its content (including any Services) are owned by NASD or NASD's suppliers. Neither this Agreement (nor your access to the Site) transfers to you or any third party any rights, title, or interest in or to such intellectual property rights, except for the limited access rights expressly set forth in Sections 3.1 and 3.2. NASD and its suppliers reserve all rights not granted in this Agreement. There are no implied licenses granted under this Agreement.
                    </Text>
                  </View>
                  {/* Third-Party Services */}
                  <View style={styles.li}>
                    <Text style={styles.p}>
                      <Text style={styles.bold}>Third-Party Services. </Text>
                      Certain features of the Services may rely on third-party websites, services, technology, or applications accessible or otherwise connected to the Services but not provided by NASD, including without limitation any blockchains, any validator on such blockchains, and our third-party API providers (each, a "Third-Party Service" and, collectively, "Third-Party Services"). The Service utilizes the cross chain transfer protocol developed by M^0 Foundation ("M^0") and other M^0 tools to process digital asset transfers. Notwithstanding anything to the contrary in this Agreement, you acknowledge and agree that (a) NASD shall not be liable for any damages, liabilities, or other harms in connection with your use of and/or any inability to access the Third-Party Services; and (b) NASD shall be under no obligation to inquire into and shall not be liable for any damages, other liabilities, or harm to any person or entity relating to any losses, delays, failures, errors, interruptions, or loss of data occurring directly or indirectly by reason of Third-Party Services or any other circumstances beyond NASD's control, including without limitation the failure of a blockchain or other Third-Party Service. You further acknowledge and agree that you will comply with the terms of all Third-Party Services including without limitation M^0.
                    </Text>
                  </View>
                  {/* Feedback */}
                  <View style={styles.li}>
                    <Text style={styles.p}>
                      <Text style={styles.bold}>Feedback. </Text>
                      If you provide NASD with any feedback or suggestions regarding the Site or any Services ("Feedback"), you hereby grant NASD a perpetual, irrevocable, worldwide, royalty-free, transferable, sublicensable, nonexclusive right and license to use and fully exploit such Feedback and related information in any manner it deems appropriate. NASD will treat any Feedback you provide to NASD as non-confidential and non-proprietary. You agree that you will not submit to NASD any information or ideas that you consider to be confidential or proprietary.
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.li}>
                <Text style={styles.p}>
                  <Text style={styles.bold}>User Conduct. </Text>
                  You agree that you are solely responsible for your conduct in connection with the Services. You agree that you will abide by this Agreement and will not (and will not attempt to): (a) provide false or misleading information to NASD; (b) use or attempt to use another user's Wallet without authorization from such user; (c) use the Services in any manner that could interfere with, disrupt, negatively affect or inhibit other users from fully enjoying the Services, or that could damage, disable, overburden or impair the functioning of the Services in any manner; (d) develop, utilize, or disseminate any software, or interact with any API in any manner, that could damage, harm, or impair the Services; (e) bypass or circumvent measures employed to prevent or limit access to any service, area, or code of the Services; (f) collect or harvest data from our Services that would allow you to contact individuals, companies, or other persons or entities, or use any such data to contact such entities; (g) use data collected from our Services for any direct marketing activity (including without limitation, email marketing, SMS marketing, telemarketing, and direct marketing); (h) bypass or ignore instructions that control all automated access to the Services; (i) use the Service for any illegal or unauthorized purpose, or engage in, encourage, or promote any activity that violates any applicable law or this Agreement; (j) use your Wallet to carry out any illegal activities in connection with or in any way related to your access to and use of the Services, including but not limited to money laundering, terrorist financing or deliberately engaging in activities designed to adversely affect the performance of the Services; (k) engage in or knowingly facilitate any “front-running,” “wash trading,” “pump and dump trading,” “ramping,” “cornering” or fraudulent, deceptive or manipulative trading activities, including: (i) trading User Assets at successively lower or higher prices for the purpose of creating or inducing a false, misleading or artificial appearance of activity in such User Asset, unduly or improperly influencing the market price for such User Asset on the Services or any blockchain or establishing a price which does not reflect the true state of the market in such User Asset; (ii) for the purpose of creating or inducing a false or misleading appearance of activity in a User Asset or creating or inducing a false or misleading appearance with respect to the market in a User Asset; or (iii) participating in, facilitating, assisting or knowingly transacting with any pool, syndicate or joint account organized for the purpose of unfairly or deceptively influencing the market price of a User Asset; (l) use the Services to carry out any financial activities subject to registration or licensing, including but not limited to using the Services to transact in securities, debt financings, equity financings or other similar transactions except in strict compliance with applicable law; (m) use the Service to participate in fundraising for a business, protocol, or platform except in strict compliance with applicable law; (n) make available any content that infringes any patent, trademark, trade secret, copyright, right of publicity or other right of any person or entity; or (o) attempt to access any Wallet that you do not have the legal authority to access. Any unauthorized use of any Services terminates the licenses granted by NASD pursuant to this Agreement.
                </Text>
              </View>
              <View style={styles.li}>
                <Text style={styles.p}>
                  <Text style={styles.bold}>Privacy Policy. </Text>
                  Please refer to our Privacy Policy for information on how we collect, use, and disclose information from our users. You acknowledge and agree that your use of the Services is subject to, and that we have the right to collect, use, and/or disclose your information (including any personal data you provide to us and your Wallet address and IP address) in accordance with our Privacy Policy.
                </Text>
              </View>
              <View style={styles.li}>
                <Text style={styles.p}><Text style={styles.bold}>Fees.</Text></Text>
                <View style={styles.ol}>
                  {/* 3.1 */}
                  <View style={styles.li}>
                    <Text style={styles.p}>
                      <Text style={styles.bold}>Fees. </Text>
                      Access to certain Services is free. However, NASD may charge fees ("<Text style={styles.bold}>Fees</Text>") in connection with your use of certain Services, including without limitation, Fees based on the User Assets processed through the Services. All pricing and payment terms for such Fees are as indicated on the Services, and any payment obligations you incur are binding at the time of the applicable transaction. In the event that NASD makes available, and you elect to purchase, any Services in connection with which NASD charges Fees, you agree that you will pay NASD all such Fees at NASD's then-current standard rates. You agree that all Fees are non-cancellable, non-refundable, and non-recoupable.
                    </Text>
                  </View>
                  {/* 3.2 */}
                  <View style={styles.li}>
                    <Text style={styles.p}>
                      <Text style={styles.bold}>Gas Fees. </Text>
                      You may incur charges from third parties ("<Text style={styles.bold}>Third-Party Fees</Text>") for network fees, known as a "gas" fee, in order to have the blockchain's validators apply a transaction message and record the results on the blockchain, resulting in a completed transaction. Third-Party Fees are not charged by NASD and are not paid to NASD.
                    </Text>
                  </View>
                  {/* 3.3 */}
                  <View style={styles.li}>
                    <Text style={styles.p}>
                      <Text style={styles.bold}>Taxes. </Text>
                      You are solely responsible (and NASD has no responsibility) for determining what, if any, taxes apply to any transaction involving your User Assets.
                    </Text>
                  </View>
                  {/* 3.4 */}
                  <View style={styles.li}>
                    <Text style={styles.p}>
                      <Text style={styles.bold}>Currency. </Text>
                      You may not substitute any other currency, whether cryptocurrency or fiat currency, for the currency in which you have contracted to pay any Fees. For clarity, no fluctuation in the value of any currency, whether cryptocurrency or otherwise, will impact or excuse your obligations with respect to any purchase.
                    </Text>
                  </View>
                  {/* 3.5 */}
                  <View style={styles.li}>
                    <Text style={styles.p}>
                      <Text style={styles.bold}>Payment Service Provider. </Text>
                      NASD may have agreements with one or more Third-Party Service providers that directly provide you payment services (e.g., card acceptance, User Asset onramps and offramps, cryptocurrency payments, disbursements and settlement, and related services) (each, a "<Text style={styles.bold}>Payment Service Provider</Text>"). You may be required to agree to and comply with a separate terms of service with an applicable Payment Services Provider in order to access certain functionality through the Services. NASD is not responsible for your ability or inability to access any services provided by a Payment Services Provider, including without limitation disbursements of funds associated with User Asset transactions. Please note that online payment transactions may be subject to validation checks by our Payment Service Provider and your card issuer, and we are not responsible if your card issuer declines to authorize payment for any reason. Payment Service Providers may use various fraud prevention protocols and industry standard verification systems to reduce fraud, and you authorize each of them to verify and authenticate your payment information. Your card issuer may charge you an online handling fee or processing fee or a cash-advance fee. We are not responsible for any such card issuer or other Third-Party Fees. We may add or change Payment Service Providers at any time in our sole discretion.
                    </Text>
                  </View>
                  {/* 3.6 */}
                  <View style={styles.li}>
                    <Text style={styles.p}>
                      <Text style={styles.bold}>Payment. </Text>
                      By providing NASD and/or our Payment Service Provider with your payment information, you agree that NASD and/or our Payment Service Provider (as applicable) is authorized to invoice your Account immediately for all Fees due and payable to NASD hereunder and that no additional notice or consent is required. You shall immediately notify NASD and/or our Payment Service Provider of any change in your payment information to maintain its completeness and accuracy. NASD reserves the right at any time to change its prices and billing methods in its sole discretion. Your failure to provide accurate payment information to NASD and/or our Payment Service Provider, as applicable, constitutes your material breach of this Agreement. Except as expressly set forth in this Agreement, all Fees for the Service are non-refundable.
                    </Text>
                  </View>
                </View>                
              </View>
              <View style={styles.li}>
                <Text style={styles.p}>
                  <Text style={styles.bold}>Indemnification. </Text>
                  You agree to indemnify and hold NASD (and its officers, employees, and agents) harmless, including costs and attorneys' fees, from any claim or demand made by any third party due to or arising out of (a) your use of the Services, (b) your violation of this Agreement, (c) your access and use of any Service, or (d) your violation of applicable laws or regulations. NASD reserves the right, at your expense, to assume the exclusive defense and control of any matter for which you are required to indemnify us, and you agree to cooperate with our defense of these claims. You agree not to settle any matter without the prior written consent of NASD. NASD will use reasonable efforts to notify you of any such claim, action, or proceeding upon becoming aware of it.
                </Text>
              </View>
              <View style={styles.li}>
                <Text style={styles.p}>
                  <Text style={styles.bold}>Third-Party Links &amp; Ads; Other Users</Text>
                </Text>
                <View style={styles.ol}>
                  {/* 2.1 Third-Party Links & Ads */}
                  <View style={styles.li}>
                    <Text style={styles.p}>
                      <Text style={styles.bold}>Third-Party Links &amp; Ads. </Text>
                      The Services may contain links to third-party websites and services, and/or display advertisements for third parties (collectively, "<Text style={styles.bold}>Third-Party Links &amp; Ads</Text>"). Such Third-Party Links &amp; Ads are not under the control of NASD, and NASD is not responsible for any Third-Party Links &amp; Ads. NASD provides access to these Third-Party Links &amp; Ads only as a convenience to you, and does not review, approve, monitor, endorse, warrant, or make any representations with respect to Third-Party Links &amp; Ads. You use all Third-Party Links &amp; Ads at your own risk and should apply a suitable level of caution and discretion in doing so. When you click on any of the Third-Party Links &amp; Ads, the applicable third party's terms and policies apply, including the third party's privacy and data gathering practices. You should make whatever investigation you feel necessary or appropriate before proceeding with any transaction in connection with such Third-Party Links &amp; Ads.
                    </Text>
                  </View>
                  {/* 2.2 Other Users */}
                  <View style={styles.li}>
                    <Text style={styles.p}>
                      <Text style={styles.bold}>Other Users. </Text>
                      Your interactions with other Service users are solely between you and such users. You agree that NASD will not be responsible for any loss or damage incurred as the result of any such interactions. If there is a dispute between you and any Service user, we are under no obligation to become involved.
                    </Text>
                  </View>
                  {/* 2.3 Release */}
                  <View style={styles.li}>
                    <Text style={styles.p}>
                      <Text style={styles.bold}>Release. </Text>
                      You hereby release and forever discharge NASD (and our officers, employees, agents, successors, and assigns) from, and hereby waive and relinquish, each and every past, present, and future dispute, claim, controversy, demand, right, obligation, liability, action, and cause of action of every kind and nature (including personal injuries, death, and property damage), that has arisen or arises directly or indirectly out of, or that relates directly or indirectly to, the Services (including any interactions with, or act or omission of, other Service users or any Third-Party Links &amp; Ads). IF YOU ARE A CALIFORNIA RESIDENT, YOU HEREBY WAIVE CALIFORNIA CIVIL CODE SECTION 1542 IN CONNECTION WITH THE FOREGOING, WHICH STATES: "A GENERAL RELEASE DOES NOT EXTEND TO CLAIMS WHICH THE CREDITOR OR RELEASING PARTY DOES NOT KNOW OR SUSPECT TO EXIST IN HIS OR HER FAVOR AT THE TIME OF EXECUTING THE RELEASE, WHICH IF KNOWN BY HIM OR HER MUST HAVE MATERIALLY AFFECTED HIS OR HER SETTLEMENT WITH THE DEBTOR OR RELEASED PARTY."
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.li}>
                <Text style={styles.p}><Text style={styles.bold}>Disclaimers</Text></Text>
                <View style={styles.ol}>
                  {/* 3.1 AS IS */}
                  <View style={styles.li}>
                    <Text style={styles.p}>
                      <Text style={styles.bold}>AS IS. </Text>
                      THE SERVICES ARE PROVIDED ON AN "AS-IS" AND "AS AVAILABLE" BASIS, AND NASD (AND OUR SUPPLIERS) EXPRESSLY DISCLAIM ANY AND ALL WARRANTIES AND CONDITIONS OF ANY KIND, WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING ALL WARRANTIES OR CONDITIONS OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, QUIET ENJOYMENT, ACCURACY, OR NON-INFRINGEMENT. WE (AND OUR SUPPLIERS) MAKE NO WARRANTY THAT THE SERVICES WILL MEET YOUR REQUIREMENTS, WILL BE AVAILABLE ON AN UNINTERRUPTED, TIMELY, SECURE, OR ERROR-FREE BASIS, OR WILL BE ACCURATE, RELIABLE, FREE OF VIRUSES OR OTHER HARMFUL CODE, COMPLETE, LEGAL, OR SAFE. IF APPLICABLE LAW REQUIRES ANY WARRANTIES WITH RESPECT TO THE SERVICES, ALL SUCH WARRANTIES ARE LIMITED IN DURATION TO NINETY (90) DAYS FROM THE DATE OF FIRST USE. SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OF IMPLIED WARRANTIES, SO THE ABOVE EXCLUSION MAY NOT APPLY TO YOU. SOME JURISDICTIONS DO NOT ALLOW LIMITATIONS ON HOW LONG AN IMPLIED WARRANTY LASTS, SO THE ABOVE LIMITATION MAY NOT APPLY TO YOU.
                    </Text>
                  </View>
                  {/* 3.2 Not an Investment Advisor */}
                  <View style={styles.li}>
                    <Text style={styles.p}>
                      <Text style={styles.bold}>
                        NASD IS NOT AN INVESTMENT ADVISOR. NEITHER NASD NOR ITS SUPPLIERS OR LICENSORS SHALL BE RESPONSIBLE FOR INVESTMENT AND OTHER FINANCIAL DECISIONS, OR DAMAGES, OR OTHER LOSSES RESULTING FROM USE OF THE SERVICES. NEITHER NASD NOR ITS SUPPLIERS OR LICENSORS SHALL BE CONSIDERED AN "EXPERT" UNDER THE APPLICABLE SECURITIES LEGISLATION IN YOUR JURISDICTION. NEITHER NASD NOR ITS SUPPLIERS OR LICENSORS WARRANT THAT THIS SITE COMPLIES WITH THE REQUIREMENTS OF ANY APPLICABLE REGULATORY AUTHORITY, SECURITIES AND EXCHANGE COMMISSION, OR ANY SIMILAR ORGANIZATION OR REGULATOR OR WITH THE SECURITIES LAWS OF ANY JURISDICTION.
                      </Text>
                    </Text>
                  </View>
                  {/* 3.3 No Liability for Conduct of Third Parties */}
                  <View style={styles.li}>
                    <Text style={styles.p}>
                      <Text style={styles.bold}>NO LIABILITY FOR CONDUCT OF THIRD PARTIES. </Text>
                      YOU ACKNOWLEDGE AND AGREE THAT NASD IS NOT LIABLE, AND YOU AGREE NOT TO HOLD OR SEEK TO HOLD NASD LIABLE, FOR THE CONDUCT OF THIRD PARTIES, INCLUDING OPERATORS OF EXTERNAL SITES AND PROVIDERS OF USER ASSET INFORMATION, AND THAT THE RISK OF INJURY FROM SUCH THIRD PARTIES RESTS ENTIRELY WITH YOU. NASD MAKES NO WARRANTY THAT THE GOODS OR SERVICES PROVIDED BY THIRD PARTIES, INCLUDING WITHOUT LIMITATION ANY DIGITAL ASSETS, WILL MEET YOUR REQUIREMENTS OR BE AVAILABLE ON AN UNINTERRUPTED, SECURE, OR ERROR-FREE BASIS. NASD MAKES NO WARRANTY REGARDING THE QUALITY OF ANY SUCH DIGITAL ASSETS OR OTHER GOODS OR SERVICES, OR THE ACCURACY, TIMELINESS, TRUTHFULNESS, COMPLETENESS OR RELIABILITY OF ANY CONNECTED CONTENT OBTAINED THROUGH THE SERVICES. YOU FURTHER ACKNOWLEDGE AND AGREE THAT USER ASSET INFORMATION COMPRISES DATA PROVIDED BY THIRD-PARTY SOURCES AND NASD DOES NOT VERIFY THE ACCURACY OF SUCH DATA. YOU ARE RESPONSIBLE FOR VERIFYING ALL USER ASSET INFORMATION.
                    </Text>
                  </View>
                  {/* 3.4 Digital Assets */}
                  <View style={styles.li}>
                    <Text style={styles.p}>
                      <Text style={styles.bold}>Digital Assets. </Text>
                      Notwithstanding anything to the contrary in this Agreement, NASD shall be under no obligation to inquire into and shall not be liable for any damages, other liabilities or harm to any person or entity relating to (a) the ownership, validity or genuineness of any User Asset; (b) the collectability, insurability, effectiveness, marketability or suitability of any User Asset; or (c) any losses, delays, failures, errors, interruptions or loss of data occurring directly or indirectly by reason of circumstances beyond NASD's control, including without limitation the failure of a blockchain, Third-Party Protocol or other Third-Party Service.
                    </Text>
                  </View>
                  {/* 3.5 No Guaranteed Returns */}
                  <View style={styles.li}>
                    <Text style={styles.p}>
                      <Text style={styles.bold}>No Guaranteed Returns. </Text>
                      All claims, estimates, specifications, and performance measurements described on the Services, including the projected API on User Assets, are made in good faith. You are solely responsible for checking and validating their accuracy and truthfulness, and NASD shall have no responsibility or obligation relating to the foregoing. Any content produced by NASD on the Services has not been subject to audit and is for informational purposes only.
                    </Text>
                  </View>
                  {/* 3.6 Beta Features */}
                  <View style={styles.li}>
                    <Text style={styles.p}>
                      <Text style={styles.bold}>Beta Features. </Text>
                      FROM TIME TO TIME, NASD MAY OFFER NEW "BETA" FEATURES OR TOOLS WITH WHICH REGISTERED USERS MAY EXPERIMENT. SUCH FEATURES OR TOOLS ARE OFFERED SOLELY FOR EXPERIMENTAL PURPOSES AND WITHOUT ANY WARRANTY OF ANY KIND, AND MAY BE MODIFIED OR DISCONTINUED AT NASD'S SOLE DISCRETION. THE PROVISIONS OF THIS SECTION APPLY WITH FULL FORCE TO SUCH FEATURES OR TOOLS.
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.li}>
                <Text style={styles.p}><Text style={styles.bold}>Limitation on Liability</Text></Text>
              </View>              
            </View>

            <Text style={styles.p}>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL NASD (OR OUR SUPPLIERS) BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY LOST PROFITS, LOST DATA, COSTS OF PROCUREMENT OF SUBSTITUTE PRODUCTS, OR ANY INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, SPECIAL, OR PUNITIVE DAMAGES ARISING FROM OR RELATING TO THIS AGREEMENT OR YOUR USE OF, OR INABILITY TO USE, THE SERVICES, EVEN IF NASD HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. ACCESS TO, AND USE OF, THE SERVICES IS AT YOUR OWN DISCRETION AND RISK, AND YOU WILL BE SOLELY RESPONSIBLE FOR ANY DAMAGE TO YOUR DEVICE OR COMPUTER SYSTEM, OR LOSS OF DATA RESULTING THEREFROM.
            </Text>

            <Text style={styles.p}>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, NOTWITHSTANDING ANYTHING TO THE CONTRARY CONTAINED HEREIN, OUR LIABILITY TO YOU FOR ANY DAMAGES ARISING FROM OR RELATED TO THIS AGREEMENT (FOR ANY CAUSE WHATSOEVER AND REGARDLESS OF THE FORM OF THE ACTION), WILL AT ALL TIMES BE LIMITED TO A MAXIMUM OF ONE HUNDRED US DOLLARS ($100). THE EXISTENCE OF MORE THAN ONE CLAIM WILL NOT ENLARGE THIS LIMIT. YOU AGREE THAT OUR SUPPLIERS WILL HAVE NO LIABILITY OF ANY KIND ARISING FROM OR RELATING TO THIS AGREEMENT.
            </Text>

            <Text style={styles.p}>
              SOME JURISDICTIONS DO NOT ALLOW THE LIMITATION OR EXCLUSION OF LIABILITY FOR INCIDENTAL OR CONSEQUENTIAL DAMAGES, SO THE ABOVE LIMITATION OR EXCLUSION MAY NOT APPLY TO YOU.
            </Text>

            {/* Start Ordered List (start=11) */}
            <View style={styles.ol}>
              {/* 11. Term and Termination */}
              <View style={styles.li}>
                <Text style={styles.p}>
                  <Text style={styles.bold}>Term and Termination. </Text>
                  Subject to this Section, this Agreement will remain in full force and effect while you use the Services. We may suspend or terminate your rights to use the Services at any time for any reason at our sole discretion, including for any use of the Services in violation of this Agreement. Upon termination of your rights under this Agreement, right to access and use the Services will terminate immediately. NASD will not have any liability whatsoever to you for any termination of your rights under this Agreement. Even after your rights under this Agreement are terminated, the following provisions of this Agreement will remain in effect: Section 2, Sections 3.3 through 3.7 and Sections 4 through 13.
                </Text>
              </View>

              {/* 12. Dispute Resolution */}
              <View style={styles.li}>
                <Text style={styles.p}>
                  <Text style={styles.bold}>Dispute Resolution. </Text>
                  Please read the following arbitration agreement in this Section (<Text style={styles.bold}>Arbitration Agreement</Text>) carefully. It requires you to arbitrate Disputes (defined below) with NASD, its parent companies, subsidiaries, affiliates, successors, and assigns, and all of their respective officers, directors, employees, agents, and representatives (collectively, the "NASD Parties") and limits the manner in which you can seek relief from the NASD Parties.
                </Text>
                <View style={styles.ol}>
                  {/* 12.1 Applicability of Arbitration Agreement */}
                  <View style={styles.li}>
                    <Text style={styles.p}>
                      <Text style={styles.bold}>Applicability of Arbitration Agreement. </Text>
                      You agree that any dispute between you and any of the NASD Parties relating in any way to Services, or this Agreement (a "<Text style={styles.bold}>Dispute</Text>") will be resolved by binding arbitration, rather than in court, except that (a) you and the NASD Parties may assert individualized claims in small claims court if the claims qualify, remain in such court, and advance solely on an individual, non-class basis; and (b) you or the NASD Parties may seek equitable relief in court for infringement or other misuse of intellectual property rights (such as trademarks, trade dress, domain names, trade secrets, copyrights, and patents).{" "}
                      <Text style={styles.bold}>
                        This Arbitration Agreement shall survive the expiration or termination of this Agreement and shall apply, without limitation, to all claims that arose or were asserted before you agreed to this Agreement (in accordance with the preamble) or any prior version of this Agreement.
                      </Text>
                      {" "}This Arbitration Agreement does not preclude you from bringing issues to the attention of federal, state, or local agencies. Such agencies can, if the law allows, seek relief against the NASD Parties on your behalf. For purposes of this Arbitration Agreement, "Dispute" will also include disputes that arose or involve facts occurring before the existence of this or any prior versions of this Agreement as well as claims that may arise after the termination of this Agreement.
                    </Text>
                  </View>
                  {/* 12.2 Informal Dispute Resolution */}
                  <View style={styles.li}>
                    <Text style={styles.p}>
                      <Text style={styles.bold}>Informal Dispute Resolution. </Text>
                      There might be instances when a Dispute arises between you and NASD. If that occurs, NASD is committed to working with you to reach a reasonable resolution. You and NASD agree that good faith informal efforts to resolve Disputes can result in a prompt, low-cost, and mutually beneficial outcome. You and NASD therefore agree that before either party commences arbitration against the other (or initiates an action in small claims court if a party so elects), we will personally meet and confer telephonically or via videoconference, in a good faith effort to resolve informally any Dispute covered by this Arbitration Agreement ("<Text style={styles.bold}>Informal Dispute Resolution Conference</Text>"). If you are represented by counsel, your counsel may participate in the conference, but you will also participate in the conference.
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Notice and Process Paragraphs */}
            <Text style={styles.p}>
              The party initiating a Dispute must give notice to the other party in writing of its intent to initiate an Informal Dispute Resolution Conference ("<Text style={styles.bold}>Notice</Text>"), which shall occur within forty-five (45) days after the other party receives such Notice, unless an extension is mutually agreed upon by the parties. Notice to NASD that you intend to initiate an Informal Dispute Resolution Conference should be sent by email to:{" "}
              <TouchableOpacity onPress={openMail}>
                <Text style={[styles.link, styles.underline]}>legal@nobleassets.xyz</Text>
              </TouchableOpacity>
              , or by regular mail to 850 New Burton Road, Suite 201, City of Dover, County of Kent, Delaware 19904. The Notice must include: (a) your name, telephone number, and mailing address; (b) the name, telephone number, mailing address, and e-mail address of your counsel, if any; and (c) a description of your Dispute.
            </Text>

            <Text style={styles.p}>
              The Informal Dispute Resolution Conference shall be individualized such that a separate conference must be held each time either party initiates a Dispute, even if the same law firm or group of law firms represents multiple users in similar cases, unless all parties agree; multiple individuals initiating a Dispute cannot participate in the same Informal Dispute Resolution Conference unless all parties agree. In the time between a party receiving the Notice and the Informal Dispute Resolution Conference, nothing in this Arbitration Agreement shall prohibit the parties from engaging in informal communications to resolve the initiating party's Dispute. Engaging in the Informal Dispute Resolution Conference is a condition precedent and requirement that must be fulfilled before commencing arbitration. The statute of limitations and any filing fee deadlines shall be tolled while the parties engage in the Informal Dispute Resolution Conference process required by this Section.
            </Text>

            <View style={styles.ol}>
              <View style={styles.li}>
                <Text style={styles.p}>
                  <Text style={styles.bold}>Arbitration Rules and Forum. </Text>
                  This Agreement evidence a transaction involving interstate commerce; and notwithstanding any other provision herein with respect to the applicable substantive law, the Federal Arbitration Act, 9 U.S.C. § 1 et seq., will govern the interpretation and enforcement of this Arbitration Agreement and any arbitration proceedings. If the process described in Section 12.2 does not resolve satisfactorily within sixty (60) days after receipt of your Notice, you and NASD agree that either party shall have the right to finally resolve the Dispute through binding arbitration. The Federal Arbitration Act governs the interpretation and enforcement of this Arbitration Agreement. The arbitration will be conducted by JAMS, an established alternative dispute resolution provider. Disputes involving claims and counterclaims with an amount in controversy under $250,000, not inclusive of attorneys' fees and interest, shall be subject to JAMS's most current version of the Streamlined Arbitration Rules and procedures available at{' '}
                  <Text style={styles.link} onPress={openJamsStreamlined}>
                    http://www.jamsadr.com/rules-streamlined-arbitration/
                  </Text>
                  ; all other claims shall be subject to JAMS's most current version of the Comprehensive Arbitration Rules and Procedures, available at{' '}
                  <Text style={styles.link} onPress={openJamsComprehensive}>
                    http://www.jamsadr.com/rules-comprehensive-arbitration/
                  </Text>
                  . JAMS's rules are also available at{' '}
                  <Text style={styles.link} onPress={openJams}>
                    www.jamsadr.com
                  </Text>
                  {' '}or by calling JAMS at{' '}
                  <Text style={styles.link} onPress={callJams}>
                    800-352-5267
                  </Text>
                  . A party who wishes to initiate arbitration must provide the other party with a request for arbitration (the "Request"). The Request must include: (a) the name, telephone number, mailing address, and e-mail address of the party seeking arbitration; (b) a statement of the legal claims being asserted and the factual basis of those claims; (c) a description of the remedy sought and an accurate, good-faith calculation of the amount in controversy in United States Dollars; (d) a statement certifying completion of the process described in Section 12.2; and (e) evidence that the requesting party has paid any necessary filing fees in connection with such arbitration.
                </Text>
              </View>
            </View>

            <Text style={styles.p}>
              If the party requesting arbitration is represented by counsel, the Request shall also include counsel's name, telephone number, mailing address, and email address. Such counsel must also sign the Request. By signing the Request, counsel certifies to the best of counsel's knowledge, information, and belief, formed after an inquiry reasonable under the circumstances, that: (i) the Request is not being presented for any improper purpose, such as to harass, cause unnecessary delay, or needlessly increase the cost of dispute resolution; (ii) the claims, defenses, and other legal contentions are warranted by existing law or by a nonfrivolous argument for extending, modifying, or reversing existing law or for establishing new law; and (iii) the factual and damages contentions have evidentiary support or, if specifically so identified, will likely have evidentiary support after a reasonable opportunity for further investigation or discovery.
            </Text>

            <Text style={styles.p}>
              Unless you and NASD otherwise agree, or the Batch Arbitration (defined below) process discussed in Section 12.8 is triggered, the arbitration will be conducted in the county where you reside. Subject to JAMS's rules, the arbitrator may direct a limited and reasonable exchange of information between the parties, consistent with the expedited nature of the arbitration. If the JAMS is not available to arbitrate, the parties will select an alternative arbitral forum. Your responsibility to pay any JAMS fees and costs will be solely as set forth in the applicable JAMS rules.
            </Text>

            <Text style={styles.p}>
              You and NASD agree that all materials and documents exchanged during the arbitration proceedings shall be kept confidential and shall not be shared with anyone except the parties' attorneys, accountants, or business advisors, and then subject to the condition that they agree to keep all materials and documents exchanged during the arbitration proceedings confidential.
            </Text>

            <View style={styles.ol}>
              {/* 4. Authority of Arbitrator */}
              <View style={styles.li}>
                <Text style={styles.p}>
                  <Text style={styles.bold}>Authority of Arbitrator. </Text>
                  The arbitrator shall have exclusive authority to resolve all disputes subject to arbitration hereunder including, without limitation, any dispute related to the interpretation, applicability, enforceability, or formation of this Arbitration Agreement or any portion of the Arbitration Agreement, except for the following: (a) all Disputes arising out of or relating to Section 12.6, including any claim that all or part of Section 12.6 is unenforceable, illegal, void, or voidable, or that Section 12.6 has been breached, shall be decided by a court of competent jurisdiction and not by an arbitrator; (b) except as expressly contemplated in Section 12.8, all Disputes about the payment of arbitration fees shall be decided only by a court of competent jurisdiction and not by an arbitrator; (c) all Disputes about whether either party has satisfied any condition precedent to arbitration shall be decided only by a court of competent jurisdiction and not by an arbitrator; and (d) all Disputes about which version of the Arbitration Agreement applies shall be decided only by a court of competent jurisdiction and not by an arbitrator. The arbitration proceeding will not be consolidated with any other matters or joined with any other cases or parties, except as expressly provided in Section 12.8. The arbitrator shall have the authority to grant motions dispositive of all or part of any claim or dispute. The arbitrator shall have the authority to award monetary damages and to grant any non-monetary remedy or relief available to an individual party under applicable law, the arbitral forum's rules, and this Agreement (including the Arbitration Agreement). The arbitrator shall issue a written award and statement of decision describing the essential findings and conclusions on which any award (or decision not to render an award) is based, including the calculation of any damages awarded. The arbitrator shall follow the applicable law. The award of the arbitrator is final and binding upon you and us. Judgment on the arbitration award may be entered in any court having jurisdiction.
                </Text>
              </View>
              {/* 5. Waiver of Jury Trial */}
              <View style={styles.li}>
                <Text style={styles.p}>
                  <Text style={styles.bold}>Waiver of Jury Trial. </Text>
                  EXCEPT AS SPECIFIED in SECTION 12.1 YOU AND THE NASD PARTIES HEREBY WAIVE ANY CONSTITUTIONAL AND STATUTORY RIGHTS TO SUE IN COURT AND HAVE A TRIAL IN FRONT OF A JUDGE OR A JURY. You and the NASD Parties are instead electing that all covered claims and disputes shall be resolved exclusively by arbitration under this Arbitration Agreement, except as specified in Section 12.1 above. An arbitrator can award on an individual basis the same damages and relief as a court and must follow this Agreement as a court would. However, there is no judge or jury in arbitration, and court review of an arbitration award is subject to very limited review.
                </Text>
              </View>
              {/* 6. Waiver of Class or Other Non-Individualized Relief */}
              <View style={styles.li}>
                <Text style={styles.p}>
                  <Text style={styles.bold}>Waiver of Class or Other Non-Individualized Relief. </Text>
                  YOU AND NASD AGREE THAT, EXCEPT AS SPECIFIED IN SECTION 12.8 EACH OF US MAY BRING CLAIMS AGAINST THE OTHER ONLY ON AN INDIVIDUAL BASIS AND NOT ON A CLASS, REPRESENTATIVE, OR COLLECTIVE BASIS, AND THE PARTIES HEREBY WAIVE ALL RIGHTS TO HAVE ANY DISPUTE BE BROUGHT, HEARD, ADMINISTERED, RESOLVED, OR ARBITRATED ON A CLASS, COLLECTIVE, REPRESENTATIVE, OR MASS ACTION BASIS. ONLY INDIVIDUAL RELIEF IS AVAILABLE, AND DISPUTES OF MORE THAN ONE CUSTOMER OR USER CANNOT BE ARBITRATED OR CONSOLIDATED WITH THOSE OF ANY OTHER CUSTOMER OR USER. Subject to this Arbitration Agreement, the arbitrator may award declaratory or injunctive relief only in favor of the individual party seeking relief and only to the extent necessary to provide relief warranted by the party's individual claim. Nothing in this paragraph is intended to, nor shall it, affect the terms and conditions under Section 12.8. Notwithstanding anything to the contrary in this Arbitration Agreement, if a court decides by means of a final decision, not subject to any further appeal or recourse, that the limitations of this Section are invalid or unenforceable as to a particular claim or request for relief (such as a request for public injunctive relief), you and NASD agree that that particular claim or request for relief (and only that particular claim or request for relief) shall be severed from the arbitration and may be litigated in the state or federal courts located in the State of Delaware. All other Disputes shall be arbitrated or litigated in small claims court. This Section does not prevent you or NASD from participating in a class-wide settlement of claims.
                </Text>
              </View>
              {/* 7. Attorneys' Fees and Costs */}
              <View style={styles.li}>
                <Text style={styles.p}>
                  <Text style={styles.bold}>Attorneys' Fees and Costs. </Text>
                  The parties shall bear their own attorneys' fees and costs in arbitration unless the arbitrator finds that either the substance of the Dispute or the relief sought in the Request was frivolous or was brought for an improper purpose (as measured by the standards set forth in Federal Rule of Civil Procedure 11(b)). If you or NASD need to invoke the authority of a court of competent jurisdiction to compel arbitration, then the party that obtains an order compelling arbitration in such action shall have the right to collect from the other party its reasonable costs, necessary disbursements, and reasonable attorneys' fees incurred in securing an order compelling arbitration. The prevailing party in any court action relating to whether either party has satisfied any condition precedent to arbitration, including the process described in Section 12.2, is entitled to recover their reasonable costs, necessary disbursements, and reasonable attorneys' fees and costs.
                </Text>
              </View>
              {/* 8. Batch Arbitration */}
              <View style={styles.li}>
                <Text style={styles.p}>
                  <Text style={styles.bold}>Batch Arbitration. </Text>
                  To increase the efficiency of administration and resolution of arbitrations, you and NASD agree that in the event that there are 100 or more individual Requests of a substantially similar nature filed against NASD by or with the assistance of the same law firm, group of law firms, or organizations, within a thirty (30) day period (or as soon as possible thereafter), the JAMS shall (a) administer the arbitration demands in batches of 100 Requests per batch (plus, to the extent there are less than 100 Requests left over after the batching described above, a final batch consisting of the remaining Requests); (b) appoint one arbitrator for each batch; and (c) provide for the resolution of each batch as a single consolidated arbitration with one set of filing and administrative fees due per side per batch, one procedural calendar, one hearing (if any) in a place to be determined by the arbitrator, and one final award ("Batch Arbitration").
                </Text>
              </View>
            </View>

            <Text style={styles.p}>
              All parties agree that Requests are of a "substantially similar nature" if they arise out of or relate to the same event or factual scenario and raise the same or similar legal issues and seek the same or similar relief. To the extent the parties disagree on the application of the Batch Arbitration process, the disagreeing party shall advise the JAMS, and the JAMS shall appoint a sole standing arbitrator to determine the applicability of the Batch Arbitration process ("Administrative Arbitrator"). In an effort to expedite resolution of any such dispute by the Administrative Arbitrator, the parties agree the Administrative Arbitrator may set forth such procedures as are necessary to resolve any disputes promptly. The Administrative Arbitrator's fees shall be paid by NASD.
            </Text>

            <Text style={styles.p}>
              You and NASD agree to cooperate in good faith with the JAMS to implement the Batch Arbitration process including the payment of single filing and administrative fees for batches of Requests, as well as any steps to minimize the time and costs of arbitration, which may include: (i) the appointment of a discovery special master to assist the arbitrator in the resolution of discovery disputes; and (ii) the adoption of an expedited calendar of the arbitration proceedings.
            </Text>

            <Text style={styles.p}>
              This Batch Arbitration provision shall in no way be interpreted as authorizing a class, collective, and/or mass arbitration or action of any kind, or arbitration involving joint or consolidated claims under any circumstances, except as expressly set forth in this provision.
            </Text>

            <View style={{ marginBottom: 24 }}>
              {/* 9. 30-Day Right to Opt Out */}
              <View style={styles.li}>
                <Text style={styles.p}>
                  <Text style={styles.bold}>30-Day Right to Opt Out. </Text>
                  You have the right to opt out of the provisions of this Arbitration Agreement by sending a timely written notice of your decision to opt out to the following address: 850 New Burton Road, Suite 201, City of Dover, County of Kent, Delaware 19904, or email to{' '}
                  <Text
                    style={styles.a}
                    onPress={() => Linking.openURL('mailto:legal@nobleassets.xyz')}>
                    legal@nobleassets.xyz
                  </Text>
                  , within thirty (30) days after first becoming subject to this Arbitration Agreement. Your notice must include your name and address and a clear statement that you want to opt out of this Arbitration Agreement. If you opt out of this Arbitration Agreement, all other parts of this Agreement will continue to apply to you. Opting out of this Arbitration Agreement has no effect on any other arbitration agreements that you may currently have with us or may enter into in the future with us.
                </Text>
              </View>
              {/* 10. Invalidity, Expiration */}
              <View style={styles.li}>
                <Text style={styles.p}>
                  <Text style={styles.bold}>Invalidity, Expiration. </Text>
                  Except as provided in Section 12.6, if any part or parts of this Arbitration Agreement are found under the law to be invalid or unenforceable, then such specific part or parts shall be of no force and effect and shall be severed and the remainder of the Arbitration Agreement shall continue in full force and effect. You further agree that any Dispute that you have with NASD as detailed in this Arbitration Agreement must be initiated via arbitration within the applicable statute of limitation for that claim or controversy, or it will be forever time barred. Likewise, you agree that all applicable statutes of limitation will apply to such arbitration in the same manner as those statutes of limitation would apply in the applicable court of competent jurisdiction.
                </Text>
              </View>
              {/* 11. Modification */}
              <View style={styles.li}>
                <Text style={styles.p}>
                  <Text style={styles.bold}>Modification. </Text>
                  Notwithstanding any provision in this Agreement to the contrary, we agree that if NASD makes any future material change to this Arbitration Agreement, you may reject that change within thirty (30) days of such change becoming effective by writing NASD at the following address: 850 New Burton Road, Suite 201, City of Dover, County of Kent, Delaware 19904 or email to{' '}
                  <Text
                    style={styles.a}
                    onPress={() => Linking.openURL('mailto:legal@nobleassets.xyz')}>
                    legal@nobleassets.xyz
                  </Text>
                  . Unless you reject the change within thirty (30) days of such change becoming effective by writing to NASD in accordance with the foregoing, your continued use of the Services following the posting of changes to this Arbitration Agreement constitutes your acceptance of any such changes. Changes to this Arbitration Agreement do not provide you with a new opportunity to opt out of the Arbitration Agreement if you have previously agreed to a version of this Agreement and did not validly opt out of arbitration. If you reject any change or update to this Arbitration Agreement, and you were bound by an existing agreement to arbitrate Disputes arising out of or relating in any way to your access to or use of the Services, any communications you receive, any products sold or distributed through the Services or this Agreement, the provisions of this Arbitration Agreement as of the date you first accepted this Agreement (or accepted any subsequent changes to this Agreement) remain in full force and effect. NASD will continue to honor any valid opt outs of the Arbitration Agreement that you made to a prior version of this Agreement.
                </Text>
              </View>
              {/* 12. General */}
              <View style={styles.li}>
                <Text style={[styles.p, styles.bold]}>General</Text>
                <View style={styles.ol}>
                  {/* a. Changes */}
                  <View style={styles.li}>
                    <Text style={styles.p}>
                      <Text style={styles.bold}>Changes. </Text>
                      These Terms are subject to occasional revision. When changes are made, NASD will make a new copy of these Terms available at the Site and any new Supplemental Terms will be made available from within, or through, the affected Service on the Site. We will also update the "Last Updated" date at the top of these Terms. Any changes to this Agreement will be effective immediately for new users of the Site and/or Services and will be effective thirty (30) days after posting notice of such changes on the Site for existing users. NASD may require you to provide consent to the updated Agreement in a specified manner before further use of the Site and/or the Services is permitted. If you do not agree to any change(s) after receiving a notice of such change(s), you shall stop using the Services. Otherwise, your continued use of the Services constitutes your acceptance of such change(s). PLEASE REGULARLY CHECK THE SITE TO VIEW THE THEN-CURRENT TERMS.
                    </Text>
                  </View>
                  {/* b. Export */}
                  <View style={styles.li}>
                    <Text style={styles.p}>
                      <Text style={styles.bold}>Export. </Text>
                      The Services may be subject to U.S. export control laws and may be subject to export or import regulations in other countries. You agree not to export, reexport, or transfer, directly or indirectly, any U.S. technical data acquired from NASD, or any products utilizing such data, in violation of the United States export laws or regulations.
                    </Text>
                  </View>
                  {/* c. Disclosures */}
                  <View style={styles.li}>
                    <Text style={styles.p}>
                      <Text style={styles.bold}>Disclosures. </Text>
                      NASD is located at the address in Section 13.11. If you are a California resident, you may report complaints to the Complaint Assistance Unit of the Division of Consumer Product of the California Department of Consumer Affairs by contacting them in writing at 1625 North Market Blvd., Suite N-112, Sacramento, CA 95834, or by telephone at{' '}
                      <Text
                        style={styles.a}
                        onPress={() => Linking.openURL('tel:8009525210')}>
                        (800) 952-5210
                      </Text>
                      .
                    </Text>
                  </View>
                  {/* d. Electronic Communications */}
                  <View style={styles.li}>
                    <Text style={styles.p}>
                      <Text style={styles.bold}>Electronic Communications. </Text>
                      The communications between you and NASD use electronic means, whether you use the Services or send us emails, or whether NASD posts notices on the Services or communicates with you via email. For contractual purposes, you (a) consent to receive communications from NASD in an electronic form; and (b) agree that all terms and conditions, agreements, notices, disclosures, and other communications that NASD provides to you electronically satisfy any legal requirement that such communications would satisfy if they were in a hardcopy writing. The foregoing does not affect your non-waivable rights.
                    </Text>
                  </View>
                  {/* e. Governing Law */}
                  <View style={styles.li}>
                    <Text style={styles.p}>
                      <Text style={styles.bold}>Governing Law. </Text>
                      THIS AGREEMENT AND ANY ACTION RELATED THERETO WILL BE GOVERNED AND INTERPRETED BY AND UNDER THE LAWS OF THE STATE OF DELAWARE, CONSISTENT WITH THE FEDERAL ARBITRATION ACT, WITHOUT GIVING EFFECT TO ANY PRINCIPLES THAT PROVIDE FOR THE APPLICATION OF THE LAW OF ANOTHER JURISDICTION. THE UNITED NATIONS CONVENTION ON CONTRACTS FOR THE INTERNATIONAL SALE OF GOODS DOES NOT APPLY TO THIS AGREEMENT. To the extent the parties are permitted under this Agreement to initiate litigation in a court, both you and NASD agree that all claims and disputes arising out of or relating to this Agreement will be litigated exclusively in the state or federal courts located in Wilmington, Delaware.
                    </Text>
                  </View>
                  {/* f. International Users */}
                  <View style={styles.li}>
                    <Text style={styles.p}>
                      <Text style={styles.bold}>International Users. </Text>
                      The Services can be accessed from countries around the world and may contain references to Services that are not available in your country. These references do not imply that NASD intends to offer such Services in your country. NASD makes no representations that the Services are appropriate or available for use in your location. Anyone accessing the Services does so of their own volition and is responsible for compliance with applicable law.
                    </Text>
                  </View>
                  {/* g. Force Majeure */}
                  <View style={styles.li}>
                    <Text style={styles.p}>
                      <Text style={styles.bold}>Force Majeure. </Text>
                      NASD shall not be liable for any delay or failure to perform resulting from causes outside its control, including, but not limited to, acts of God, war, terrorism, riots, embargos, acts of civil or military authorities, epidemics, pandemics, governing laws, rules or regulations, fire, floods, accidents, strikes or shortages of transportation facilities, fuel, energy, labor or materials.
                    </Text>
                  </View>
                  {/* h. Export Control */}
                  <View style={styles.li}>
                    <Text style={styles.p}>
                      <Text style={styles.bold}>Export Control. </Text>
                      You may not use, export, import, or transfer the Services except as authorized by U.S. law, the laws of the jurisdiction in which you access the Services, and any other applicable laws.
                    </Text>
                  </View>
                  {/* i. Entire Agreement */}
                  <View style={styles.li}>
                    <Text style={styles.p}>
                      <Text style={styles.bold}>Entire Agreement. </Text>
                      This Agreement constitutes the entire agreement between you and us regarding the use of the Services. Our failure to exercise or enforce any right or provision of this Agreement shall not operate as a waiver of such right or provision. The section titles in this Agreement are for convenience only and have no legal or contractual effect. The word "including" means "including without limitation". If any provision of this Agreement is, for any reason, held to be invalid or unenforceable, the other provisions of this Agreement will be unimpaired, and the invalid or unenforceable provision will be deemed modified so that it is valid and enforceable to the maximum extent permitted by law. Your relationship to NASD is that of an independent contractor, and neither party is an agent or partner of the other. This Agreement, and your rights and obligations herein, may not be assigned, subcontracted, delegated, or otherwise transferred by you without NASD's prior written consent, and any attempted assignment, subcontract, delegation, or transfer in violation of the foregoing will be null and void. NASD may freely assign this Agreement. The terms and conditions set forth in this Agreement shall be binding upon assignees.
                    </Text>
                  </View>
                  {/* j. Copyright/Trademark Information */}
                  <View style={styles.li}>
                    <Text style={styles.p}>
                      <Text style={styles.bold}>Copyright/Trademark Information. </Text>
                      Copyright © 2025 NASD, Inc. All rights reserved. All trademarks, logos, and service marks ("<Text style={styles.bold}>Marks</Text>") displayed on the Services or on the Services are our property or the property of other third parties. You are not permitted to use these Marks without our prior written consent or the consent of such third party which may own the Marks.
                    </Text>
                  </View>
                  {/* k. Contact Information */}
                  <View style={styles.li}>
                    <Text style={styles.p}>
                      <Text style={styles.bold}>Contact Information: </Text>
                      {/* You may add actual contact details or render them below as needed */}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            
            <Text style={[styles.p, { marginTop: 24, marginBottom: 32 }]}>
              {/* Use last lines of the agreement for legal address and email */}
              ATTN: NASD{'\n'}
              1919 14th Street, Suite 700{'\n'}
              Boulder, CO 80302{'\n'}
              Email:{' '}
              <Text
                style={styles.link}
                onPress={() => openLink(termsLinks.nasdEmail)}
              >
                legal@nobleassets.xyz
              </Text>
            </Text>
          </ScrollView>

          <TouchableOpacity style={styles.button} onPress={onAgree} activeOpacity={0.8}>
            <Text style={styles.buttonText}>Agree</Text>
          </TouchableOpacity>
        </View>
      </PopupLayout>
    </View>
  );
};

export default Terms;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff', // You can adjust for dark mode if you want
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'space-between',
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 18,
    marginBottom: 18,
  },
  scrollContent: {
    paddingBottom: 18,
  },
  li: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  ol: { marginLeft: 16, marginBottom: 8 },
  underline: { textDecorationLine: 'underline' },
  a: { color: '#0645AD', textDecorationLine: 'underline' },
  p: {
    fontSize: 15,
    color: '#18191A',
    lineHeight: 22,
    marginBottom: 10,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  h2: {
    fontSize: 16,
    fontWeight: '700',
    marginVertical: 10,
    color: '#18191A',
  },
  bold: {
    fontWeight: 'bold',
  },
  link: {
    color: '#2D8C4B',
    textDecorationLine: 'underline',
  },
  button: {
    width: '100%',
    height: 48,
    borderRadius: 9999,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: Platform.OS === 'ios' ? 32 : 16,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.3,
  },
});
