/**
 * Created by Layman(http://github.com/anysome) on 16/3/1.
 */
'use strict';

import React, {StyleSheet, Component, ScrollView, View, Text, TouchableOpacity, LayoutAnimation, ActionSheetIOS} from 'react-native';
import moment from 'moment';
import {styles, colors, airloy, api, L, toast} from '/../app/app';
import Objective from '/../app/logic/Objective';

import TextField from '/../app/widgets/TextField';
import TextArea from '/../app/widgets/TextArea';
import PriorityPicker from '/../app/widgets/PriorityPicker';
import DatePicker from '/../app/widgets/DatePicker';

export default class Edit extends Component{

    constructor(props) {
        var {data, today, ...others} = props;
        super(others);
        this._title = null;
        this.today = today;
        this.agenda = data || {today: today, priority: 0, status: '0'};
        this.state = {
            title: this.agenda.title,
            detail: this.agenda.detail,
            today: moment(this.agenda.today).format('YYYY-MM-DD'),
            date: new Date(this.agenda.today),
            showPickerDate: false,
            priority: this.agenda.priority,
            showPickerPriority: false
        };
    }

    componentWillUpdate(props, state) {
        // smooths picker showing and hiding
        if (state.showPickerPriority !== this.state.showPickerPriority
                || state.showPickerDate !== this.state.showPickerDate) {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.linear);
        }
    }

    componentDidMount() {
        let route = this.props.navigator.navigationContext.currentRoute;
        if ( route.rightButtonIcon ) {
            route.onRightButtonPress = () => this._showOptions();
            this.props.navigator.replace(route);
        }
    }

    _showOptions() {
        let isFuture = this.today < this.agenda.today;
        let BUTTONS = [ isFuture ? '安排到今天' : '推迟到明天', '删除', '取消'];
        let CANCEL_INDEX = 2, DESTRUCTIVE_INDEX = 1;
        ActionSheetIOS.showActionSheetWithOptions({
                options: BUTTONS,
                cancelButtonIndex: CANCEL_INDEX,
                destructiveButtonIndex: DESTRUCTIVE_INDEX,
                tintColor: colors.dark1
            },
            async (buttonIndex) => {
                if ( buttonIndex === 0 ) {
                    let newDate = isFuture ? moment(this.today) : moment(this.today + 86400000);
                    let result = await airloy.net.httpGet(api.agenda.schedule, {
                                id: this.agenda.id,
                                newDate: newDate.format('YYYY-MM-DD') }
                            );
                    if ( result.success ) {
                        this.agenda.today = isFuture ? this.today : this.today + 86400000;
                        this.props.onFeedback(this.agenda);
                    } else {
                        toast(L(result.message));
                    }
                }
                if ( buttonIndex === 1 ) {
                    let result = await airloy.net.httpGet(api.agenda.remove, {id: this.agenda.id});
                    if ( result.success ) {
                        airloy.event.emit('target.change');
                        this.props.onDelete(this.agenda);
                    } else {
                        toast(L(result.message));
                    }
                }
            }
        );
    }


    _selectDate() {
        this.setState({
            showPickerPriority: false,
            showPickerDate: !this.state.showPickerDate
        });
    }

    _onSelectedDate(date) {
        this.setState({
            date: date,
            today: moment(date).format('YYYY-MM-DD')
        });
    }

    _selectPriority() {
        this.setState({
            showPickerDate: false,
            showPickerPriority: !this.state.showPickerPriority
        });
    }

    _onSelectedPriority(value) {
        this.setState({
            priority: value,
            showPickerPriority: false
        });
    }

    async _save() {
        let result;
        this.agenda.detail = this.state.detail;
        this.agenda.today = this.state.date;
        this.agenda.priority = this.state.priority;
        if ( this.agenda.id ) {
            if ( this._title.value.length > 0 ) {
                this.agenda.title = this.state.title;
            }
            result = await airloy.net.httpPost(api.agenda.update, this.agenda);
        } else {
            if ( this._title.value.length < 1 ) {
                this._title.focus();
                return ;
            }
            this.agenda.title = this.state.title;
            result = await airloy.net.httpPost(api.agenda.add, this.agenda);
        }
        if ( result.success ) {
            this.props.onFeedback(result.info);
        } else {
            toast(L(result.message));
        }
    }

    render() {
        return (
            <ScrollView keyboardDismissMode='on-drag' keyboardShouldPersistTaps>
                <View style={styles.section}>
                    <TextField
                        ref={c => this._title = c}
                        flat={true}
                        value={this.state.title}
                        onChangeText={(text) => this.setState({title:text})}
                        placeholder={this.agenda.title || '想做什么...'}
                        returnKeyType="done"
                    />
                    <View style={styles.separator} />
                    <TextArea
                        flat={true}
                        defaultValue={this.state.detail}
                        onChangeText={(text) => this.setState({detail:text})}
                        placeholder={this.agenda.detail || '如有备注...'}
                        returnKeyType="default"
                    />
                </View>
                <View style={styles.section}>
                    <TouchableOpacity style={styles.sectionRow} onPress={()=> this._selectDate()}>
                        <Text style={style.text}>日期</Text>
                        <Text style={styles.picker}>{this.state.today}</Text>
                    </TouchableOpacity>
                    <DatePicker visible={this.state.showPickerDate}
                                date={this.state.date}
                                onDateChange={date => this._onSelectedDate(date)} />
                    <View style={styles.separator} />
                    <TouchableOpacity style={styles.sectionRow} onPress={()=> this._selectPriority()}>
                        <Text style={style.text}>优先级</Text>
                        <Text style={styles.picker}>{Objective.getPriorityName(this.state.priority)}</Text>
                    </TouchableOpacity>
                    <PriorityPicker visible={this.state.showPickerPriority}
                                    selectedValue={this.state.priority}
                                    onValueChange={value => this._onSelectedPriority(value)}/>
                </View>
                {this.agenda.status === '0' &&
                <TouchableOpacity style={styles.row} onPress={()=> this._save()}>
                    <Text style={styles.link}>保存</Text>
                </TouchableOpacity>}
            </ScrollView>
        );
    }
}

const style = StyleSheet.create({
    text: {
        paddingTop: 5,
        paddingBottom: 5,
        color: colors.dark1,
        fontSize: 14
    }
});