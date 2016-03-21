/**
 * Created by Layman(http://github.com/anysome) on 16/3/14.
 */

import React, {StyleSheet, Component, ScrollView, View, Text, Modal, Image,
    TouchableOpacity, LayoutAnimation, ListView, PixelRatio} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import moment from 'moment';

import {config, styles, colors, airloy, api, L, toast} from '/../app/app';
import objective from '/../app/logic/Objective';

import TextField from '/../app/widgets/TextField';


export default class Content extends Component {

    constructor(props) {
        let {visible, ...others} = props;
        super(others)
        this.list = [];
        this.isChange = false;
        this.state = {
            data: {},
            comment: '',
            dataSource: new ListView.DataSource({
                rowHasChanged: (row1, row2) => true
            }),
            isKeyboardOpened: false,
            visibleBottom: 0
        };
    }

    //componentDidMount() {
    //    airloy.event.on('keyboardWillShow', (e) => {
    //        this.setState({
    //            isKeyboardOpened: true,
    //            visibleBottom: e.endCoordinates.height
    //        });
    //    });
    //    airloy.event.on('keyboardWillHide', (e) => {
    //        this.setState({
    //            isKeyboardOpened: false,
    //            visibleBottom: 0
    //        });
    //    });
    //}
    //
    //componentWillUnmount() {
    //    airloy.event.off('keyboardWillShow', 'keyboardWillHide');
    //}

    componentWillUpdate(props, state) {
        if (state.isKeyboardOpened !== this.state.isKeyboardOpened) {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        }
    }

    componentWillReceiveProps(nextProps) {
        if ( this.props.data !== nextProps.data ) {
            this.setState({data: nextProps.data});
            this.reload(nextProps.data);
        }
        if ( nextProps.visible ) {
            airloy.event.on('keyboardWillShow', (e) => {
                this.setState({
                    isKeyboardOpened: true,
                    visibleBottom: e.endCoordinates.height
                });
            });
            airloy.event.on('keyboardWillHide', (e) => {
                this.setState({
                    isKeyboardOpened: false,
                    visibleBottom: 0
                });
            });
        } else {
            airloy.event.off('keyboardWillShow', 'keyboardWillHide');
            this.setState({
                isKeyboardOpened: false,
                visibleBottom: 0
            });
        }
    }

    reload(data) {
        //airloy.net.httpGet(api.content.detail.likes, {contentId: data.id}).then(result => {
        //    if ( result.success )
        //});

        airloy.net.httpGet(api.content.detail.comments, {contentId: data.id}).then(result => {
            if ( result.success ) {
                this.list = result.info;
                this.setState({
                    dataSource: this.state.dataSource.cloneWithRows(this.list)
                });
            } else {
                toast(L(result.message));
            }
        });
    }

    async _send() {
        let result = await airloy.net.httpPost(api.content.detail.comment, {
            contentId: this.state.data.id,
            comment: this.state.comment}
        );
        if ( result.success ) {
            this.list.unshift(result.info);
            this.state.data.comments = this.state.data.comments + 1;
            this.setState({
                comment: '',
                data: this.state.data,
                dataSource: this.state.dataSource.cloneWithRows(this.list)
            });
            this.isChange = true;
        } else {
            toast(L(result.message));
        }
    }

    _close() {
        if ( this.isChange ) {
            this.props.onFeedback(this.state.data);
        } else {
            this.props.onFeedback();
        }
    }

    async _like(rowData) {
        let result = await airloy.net.httpGet(api.content.detail.like, {id: rowData.id});
        if ( result.success ) {
            if ( result.info > -1 ) {
                rowData.likes = rowData.likes + 1;
                this.setState({data: rowData});
            }
        } else {
            toast(L(result.message));
        }
    }

    _renderRow(rowData) {
        return (
            <View style={style.row}>
                <Image style={style.user}
                       source={{uri:`${config.host.avatar + rowData.userId}-60`}}  />
                <View style={styles.containerV}>
                    <View style={styles.containerF}>
                        <Text style={styles.text}>{rowData.userName}</Text>
                        <Text style={styles.hint}>{moment(rowData.createTime).toNow()}</Text>
                    </View>
                    <Text style={styles.title}>{rowData.comment}</Text>
                </View>
            </View>
        );
    }

    _renderFooter() {
        return <View style={styles.spaceV} />;
    }

    render() {
        let data = this.state.data;
        let log = data.log ? data.log : false;
        let checkDaily = data.content ? JSON.parse(data.content) : {};
        return (
            <Modal animated={true} transparent={false} visible={this.props.visible}>
                <View style={styles.window}>
                    <View style={style.header}>
                        <Image style={style.avatar}
                               source={{uri:`${config.host.avatar + data.userId}-100`}}
                               defaultSource={require('/../resources/images/avatar.png')}/>
                        <View style={styles.containerV}>
                            <View style={styles.containerF}>
                                <Text style={styles.text}>{data.userName}</Text>
                                <Text style={styles.hint}>{data.uid}</Text>
                            </View>
                            <View style={style.container}>
                                <Text style={style.text}>{checkDaily.title}</Text>
                                <Text style={styles.hint}>
                                    {`${checkDaily.total} + ${checkDaily.times} ${objective.getUnitName(checkDaily.unit)}`}
                                </Text>
                            </View>
                            {log && <Text style={styles.title}>{log}</Text>}
                        </View>
                    </View>
                    <View style={style.timeline}>
                        <Text style={style.count}>{data.likes}</Text>
                        <TouchableOpacity onPress={() => this._like(data)}>
                            <Icon size={20} name='android-favorite' color={colors.border} style={style.icon} />
                        </TouchableOpacity>
                        <Text style={style.count}>{data.comments}</Text>
                        <Icon size={20} name='chatbubble-working' color={colors.border} style={style.icon} />
                        <Text style={style.hint}>{moment(data.createTime).calendar()}</Text>
                    </View>
                    <ListView initialListSize={10}
                              pageSize={5}
                              dataSource={this.state.dataSource}
                              renderRow={this._renderRow}
                              renderFooter={this._renderFooter}
                    />
                    <View style={[style.bottom, {bottom: this.state.visibleBottom}]}>
                        <Icon size={32} name='android-close' color={colors.border} style={style.close} onPress={() => this._close()} />
                        <TextField value={this.state.comment} style={style.input}
                                   placeholder="也说两句..."
                                   onChangeText={text => this.setState({comment: text})}
                                   returnKeyType="send"
                                   onSubmitEditing={()=>this._send()}
                        />
                        <Icon.Button name='ios-chatboxes-outline' color={colors.light1}
                                     underlayColor={colors.light1}
                                     backgroundColor={colors.accent}
                                     onPress={()=> this._send()}>
                            <Text style={styles.buttonText}>评论</Text>
                        </Icon.Button>
                    </View>
                </View>
            </Modal>
        );
    }
}

const style = StyleSheet.create({
    header: {
        flexDirection: 'row',
        marginTop: 20,
        padding: 16
    },
    avatar: {
        width:80,
        height:80,
        marginRight: 16
    },
    user: {
        width:50,
        height:50,
        marginRight: 8
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent:'space-between',
        backgroundColor: colors.light1,
        padding: 8,
        margin: 5
    },
    text: {
        flex: 1,
        color: colors.dark1,
        fontSize: 14
    },
    timeline: {
        flexDirection:'row',
        padding: 2,
        marginLeft: 16,
        marginRight: 16,
        borderBottomWidth: 1 / PixelRatio.get(),
        borderBottomColor: colors.border
    },
    icon: {
        paddingLeft: 8,
        paddingRight: 16
    },
    hint: {
        flex: 1,
        fontSize: 12,
        paddingTop: 4,
        textAlign: 'right',
        color: colors.dark1
    },
    count: {
        fontSize: 14,
        color: colors.dark1
    },
    bottom: {
        position: 'absolute',
        bottom: 0,
        height: 50,
        left: 0,
        right: 0,
        paddingRight: 16,
        //borderTopWidth: 1 / PixelRatio.get(),
        //borderTopColor: colors.border,
        backgroundColor: colors.light2,
        flexDirection: 'row',
        alignItems: 'center',
    },
    close: {
        paddingLeft: 16,
        paddingRight: 8,
        backgroundColor: 'transparent'
    },
    input: {
        flex: 1,
        marginTop: 5,
        marginRight: 8
    },
    row: {
        padding: 16,
        backgroundColor: colors.light1,
        flex: 1,
        flexDirection: 'row'
    }
});