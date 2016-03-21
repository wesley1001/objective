/**
 * Created by Layman(http://github.com/anysome) on 16/3/11.
 */
'use strict';

import React, {StyleSheet, Component, ScrollView, View, Text, TouchableOpacity, LayoutAnimation} from 'react-native';
import moment from 'moment';
import {styles, colors, airloy, api, L, toast} from '/../app/app';
import Objective from '/../app/logic/Objective';

import TextField from '/../app/widgets/TextField';
import TextArea from '/../app/widgets/TextArea';
import PriorityPicker from '/../app/widgets/PriorityPicker';
import DatePicker from '/../app/widgets/DatePicker';
import OptionsPicker from '/../app/widgets/OptionsPicker';


export default class Edit extends Component {

    constructor(props) {
        let {type, data, ...others} = props;
        super(others);
        if ( data ) {
            this.target = data;
            data.type === '1' && (this.lasting = moment(data.dateEnd).diff(moment(data.dateStart), 'days') + 1);
        } else {
            this.target = {
                    type: type,
                    dateStart: new Date(),
                    priority: 1,
                    unit: '0'
                };
            switch (type) {
                case '1':
                    this.lasting = 90;
                    this.target.times = 1;
                    this.target.frequency = '1';
                    this.target.dateEnd = moment().add(89, 'days').toDate();
                    break;
                case '2':
                    this.target.times = 20;
                    this.target.dateEnd = moment().endOf('month').toDate();
                    this.target.frequency = '3';
                    break;
                case '3':
                    this.target.times = 3;
                    this.target.frequency = '2';
                    this.target.dateEnd = moment().endOf('year').toDate();
                    break;
                case '4':
                    this.target.priority = 2;
                    this.target.times = 100;
                    this.target.dateEnd = moment().add(299, 'days').toDate();
                    break;
                case '5':
                    this.target.priority = 3;
                    this.target.times = 1000;
                    this.target.dateEnd = moment().add(999, 'days').toDate();
                    this.target.unit = '1';
                    break;
                default :
                    this.target.times = 10;
                    this.target.dateEnd = moment().add(59, 'days').toDate();
                    this.target.frequency = '3';
                    this.target.unit = '3';
                    break;
            }
        }
        this.type = this.target.type;
        this.state = {
            title: this.target.title,
            detail: this.target.detail,
            priority: this.target.priority,
            dateStart: new Date(this.target.dateStart),
            dateEnd: new Date(this.target.dateEnd),
            frequency: this.target.frequency,
            unit: this.target.unit,
            times: '' + this.target.times,
            lasting: '' + this.lasting,
            showPickerPriority: false,
            showPickerFrequency: false,
            showPickerUnit: false,
            showPickerDateStart: false,
            showPickerDateEnd: false
        };
        this._title = null;
    }

    async _toDelete() {
        let result = await airloy.net.httpGet(api.target.remove, {id: this.target.id});
        if ( result.success ) {
            airloy.event.emit('target.change');
            airloy.event.emit('agenda.change');
            this.props.navigator.popToTop();
        } else {
            toast(L(result.message));
        }
    }

    async _save() {
        let url = api.target.add;
        if ( this.props.data ) {
            if (this.state.title) {
                this.target.title = this.state.title;
            }
            url = api.target.update;
        } else {
            if (this.state.title) {
                this.target.title = this.state.title;
            } else {
                this._title.focus();
                return;
            }
        }
        if ( this.target.type === '1' ) {
            this.state.dateEnd = moment(this.state.dateStart).add(parseInt(this.state.lasting)-1, 'days').toDate();
        }
        this.target.detail = this.state.detail;
        this.target.dateStart = this.state.dateStart;
        this.target.dateEnd = this.state.dateEnd;
        this.target.priority = this.state.priority;
        this.target.frequency = this.state.frequency;
        this.target.unit = this.state.unit;
        this.target.times = parseInt(this.state.times);
        let result = await airloy.net.httpPost(url, this.target);
        if ( result.success ) {
            // add and update both call reload from server
            airloy.event.emit('target.change', result.info);
            airloy.event.emit('agenda.change');
            this.props.navigator.popToTop();
        } else {
            toast(L(result.message));
        }
    }

    _renderDay() {
        return (
            <ScrollView keyboardDismissMode='on-drag' keyboardShouldPersistTaps>
                <View style={styles.section}>
                    <TextField
                        ref={c => this._title = c}
                        flat={true}
                        value={this.state.title}
                        onChangeText={(text) => this.setState({title:text})}
                        placeholder={this.target.title || '想要养成的习惯...'}
                        returnKeyType="done"
                    />
                    <View style={styles.separator} />
                    <TextArea
                        flat={true}
                        value={this.state.detail}
                        onChangeText={(text) => this.setState({detail:text})}
                        placeholder={this.target.detail || '如有其它信息可填写...'}
                        returnKeyType="default"
                    />
                </View>
                <View style={styles.section}>
                    <View style={styles.sectionRow}>
                        <Text style={style.text}>持续天数</Text>
                        <TextField
                            flat={true}
                            value={this.state.lasting}
                            onChangeText={(text) => this.setState({lasting:text})}
                            placeholder={'' + this.lasting}
                            returnKeyType="done"
                            keyboardType='number-pad'
                            style={styles.inputR}
                        />
                    </View>
                    <View style={styles.separator} />
                    <TouchableOpacity style={styles.sectionRow} onPress={()=> this._selectPriority()}>
                        <Text style={style.text}>优先级</Text>
                        <Text style={styles.picker}>{Objective.getPriorityName(this.state.priority)}</Text>
                    </TouchableOpacity>
                    <PriorityPicker visible={this.state.showPickerPriority}
                                    small={true}
                                    selectedValue={this.state.priority}
                                    onValueChange={value => this._onSelectedPriority(value)}/>
                </View>
                <TouchableOpacity style={styles.row} onPress={()=> this._save()}>
                    <Text style={styles.link}>保存</Text>
                </TouchableOpacity>
            </ScrollView>
        );
    }

    _renderMonth() {
        return (
            <ScrollView keyboardDismissMode='on-drag' keyboardShouldPersistTaps>
                <View style={styles.section}>
                    <TextField
                        ref={c => this._title = c}
                        flat={true}
                        value={this.state.title}
                        onChangeText={(text) => this.setState({title:text})}
                        placeholder={this.target.title || '本月计划...'}
                        returnKeyType="done"
                    />
                    <View style={styles.separator} />
                    <TextArea
                        flat={true}
                        value={this.state.detail}
                        onChangeText={(text) => this.setState({detail:text})}
                        placeholder={this.target.detail || '如有其它信息可填写...'}
                        returnKeyType="default"
                    />
                    <View style={styles.separator} />
                    <TouchableOpacity style={styles.sectionRow} onPress={()=> this._selectPriority()}>
                        <Text style={style.text}>优先级</Text>
                        <Text style={styles.picker}>{Objective.getPriorityName(this.state.priority)}</Text>
                    </TouchableOpacity>
                    <PriorityPicker visible={this.state.showPickerPriority}
                                    small={true}
                                    selectedValue={this.state.priority}
                                    onValueChange={value => this._onSelectedPriority(value)}/>
                </View>
                <View style={styles.section}>
                    <View style={styles.sectionRow}>
                        <Text style={style.text}>目标月份</Text>
                        <Text style={style.text}>{moment(this.state.dateEnd).format('YYYY-MM')}</Text>
                    </View>
                    <View style={styles.separator} />
                    <View style={styles.sectionRow}>
                        <Text style={style.text}>月份指标</Text>
                        <TextField
                            flat={true}
                            value={'' + this.state.times}
                            onChangeText={(text) => this.setState({times:text})}
                            placeholder={'' + this.target.times}
                            returnKeyType="done"
                            keyboardType='number-pad'
                            style={styles.inputR}
                        />
                    </View>
                    <View style={styles.separator} />
                    <TouchableOpacity style={styles.sectionRow} onPress={()=> this._selectUnit()}>
                        <Text style={style.text}>指标类型</Text>
                        <Text style={styles.picker}>{Objective.getUnitName(this.state.unit)}</Text>
                    </TouchableOpacity>
                    <OptionsPicker visible={this.state.showPickerUnit}
                                   options={Objective.unit}
                                   selectedValue={this.state.unit}
                                   onValueChange={value => this._onSelectedUnit(value)}/>
                </View>
                <TouchableOpacity style={styles.row} onPress={()=> this._save()}>
                    <Text style={styles.link}>保存</Text>
                </TouchableOpacity>
            </ScrollView>
        );
    }

    _renderYear() {
        return (
            <ScrollView keyboardDismissMode='on-drag' keyboardShouldPersistTaps>
                <View style={styles.section}>
                    <TextField
                        ref={c => this._title = c}
                        flat={true}
                        value={this.state.title}
                        onChangeText={(text) => this.setState({title:text})}
                        placeholder={this.target.title || moment(this.state.dateEnd).format('YYYY') + ' 年度目标...'}
                        returnKeyType="done"
                    />
                    <View style={styles.separator} />
                    <TextArea
                        flat={true}
                        value={this.state.detail}
                        onChangeText={(text) => this.setState({detail:text})}
                        placeholder={this.target.detail || '如有其它信息可填写...'}
                        returnKeyType="default"
                    />
                    <View style={styles.separator} />
                    <TouchableOpacity style={styles.sectionRow} onPress={()=> this._selectPriority()}>
                        <Text style={style.text}>优先级</Text>
                        <Text style={styles.picker}>{Objective.getPriorityName(this.state.priority)}</Text>
                    </TouchableOpacity>
                    <PriorityPicker visible={this.state.showPickerPriority}
                                    small={true}
                                    selectedValue={this.state.priority}
                                    onValueChange={value => this._onSelectedPriority(value)}/>
                </View>
                <View style={styles.section}>
                    <TouchableOpacity style={styles.sectionRow} onPress={()=> this._selectFrequency()}>
                        <Text style={style.text}>重复周期</Text>
                        <Text style={styles.picker}>{Objective.getFrequencyName(this.state.frequency)}</Text>
                    </TouchableOpacity>
                    <OptionsPicker visible={this.state.showPickerFrequency}
                                   options={Objective.frequency}
                                   selectedValue={this.state.frequency}
                                   onValueChange={value => this._onSelectedFrequency(value)}/>
                    <View style={styles.separator} />
                    <View style={styles.sectionRow}>
                        <Text style={style.text}>周期指标</Text>
                        <TextField
                            flat={true}
                            value={'' + this.state.times}
                            onChangeText={(text) => this.setState({times:text})}
                            placeholder={'' + this.target.times}
                            returnKeyType="done"
                            keyboardType='number-pad'
                            style={styles.inputR}
                        />
                    </View>
                    <View style={styles.separator} />
                    <TouchableOpacity style={styles.sectionRow} onPress={()=> this._selectUnit()}>
                        <Text style={style.text}>指标类型</Text>
                        <Text style={styles.picker}>{Objective.getUnitName(this.state.unit)}</Text>
                    </TouchableOpacity>
                    <OptionsPicker visible={this.state.showPickerUnit}
                                   options={Objective.unit}
                                   selectedValue={this.state.unit}
                                   onValueChange={value => this._onSelectedUnit(value)}/>
                </View>
                <TouchableOpacity style={styles.row} onPress={()=> this._save()}>
                    <Text style={styles.link}>保存</Text>
                </TouchableOpacity>
            </ScrollView>
        );
    }

    _renderAction() {
        return (
            <ScrollView keyboardDismissMode='on-drag' keyboardShouldPersistTaps>
                <View style={styles.section}>
                    <TextField
                        ref={c => this._title = c}
                        flat={true}
                        value={this.state.title}
                        onChangeText={(text) => this.setState({title:text})}
                        placeholder={this.target.title || '100次的行动最容易达成心愿...'}
                        returnKeyType="done"
                    />
                    <View style={styles.separator} />
                    <TextArea
                        flat={true}
                        value={this.state.detail}
                        onChangeText={(text) => this.setState({detail:text})}
                        placeholder={this.target.detail || '如有其它信息可填写...'}
                        returnKeyType="default"
                    />
                </View>
                <View style={styles.section}>
                    <View style={styles.sectionRow}>
                        <Text style={style.text}>行动次数</Text>
                        <TextField
                            flat={true}
                            value={'' + this.state.times}
                            onChangeText={(text) => this.setState({times:text})}
                            placeholder={'' + this.target.times}
                            returnKeyType="done"
                            keyboardType='number-pad'
                            style={styles.inputR}
                        />
                    </View>
                    <View style={styles.separator} />
                    <TouchableOpacity style={styles.sectionRow} onPress={()=> this._selectDateEnd()}>
                        <Text style={style.text}>截止日期</Text>
                        <Text style={styles.picker}>{moment(this.state.dateEnd).format('YYYY-MM-DD')}</Text>
                    </TouchableOpacity>
                    <DatePicker visible={this.state.showPickerDateEnd}
                                date={this.state.dateEnd}
                                onDateChange={date => this._onSelectedDateEnd(date)} />
                    <View style={styles.separator} />
                    <TouchableOpacity style={styles.sectionRow} onPress={()=> this._selectPriority()}>
                        <Text style={style.text}>优先级</Text>
                        <Text style={styles.picker}>{Objective.getPriorityName(this.state.priority)}</Text>
                    </TouchableOpacity>
                    <PriorityPicker visible={this.state.showPickerPriority}
                                    small={true}
                                    selectedValue={this.state.priority}
                                    onValueChange={value => this._onSelectedPriority(value)}/>
                </View>
                <TouchableOpacity style={styles.row} onPress={()=> this._save()}>
                    <Text style={styles.link}>保存</Text>
                </TouchableOpacity>
            </ScrollView>
        );
    }

    _renderTime() {
        return (
            <ScrollView keyboardDismissMode='on-drag' keyboardShouldPersistTaps>
                <View style={styles.section}>
                    <TextField
                        ref={c => this._title = c}
                        flat={true}
                        value={this.state.title}
                        onChangeText={(text) => this.setState({title:text})}
                        placeholder={this.target.title || '一万小时的专注先从1000番茄开始...'}
                        returnKeyType="done"
                    />
                    <View style={styles.separator} />
                    <TextArea
                        flat={true}
                        value={this.state.detail}
                        onChangeText={(text) => this.setState({detail:text})}
                        placeholder={this.target.detail || '如有其它信息可填写...'}
                        returnKeyType="default"
                    />
                </View>
                <View style={styles.section}>
                    <View style={styles.sectionRow}>
                        <Text style={style.text}>番茄时间</Text>
                        <TextField
                            flat={true}
                            value={'' + this.state.times}
                            onChangeText={(text) => this.setState({times:text})}
                            placeholder={'' + this.target.times}
                            returnKeyType="done"
                            keyboardType='number-pad'
                            style={styles.inputR}
                        />
                    </View>
                    <View style={styles.separator} />
                    <TouchableOpacity style={styles.sectionRow} onPress={()=> this._selectDateEnd()}>
                        <Text style={style.text}>截止日期</Text>
                        <Text style={styles.picker}>{moment(this.state.dateEnd).format('YYYY-MM-DD')}</Text>
                    </TouchableOpacity>
                    <DatePicker visible={this.state.showPickerDateEnd}
                                date={this.state.dateEnd}
                                onDateChange={date => this._onSelectedDateEnd(date)} />
                </View>
                <TouchableOpacity style={styles.row} onPress={()=> this._save()}>
                    <Text style={styles.link}>保存</Text>
                </TouchableOpacity>
            </ScrollView>
        );
    }

    _renderCustom() {
        return (
            <ScrollView keyboardDismissMode='on-drag' keyboardShouldPersistTaps>
                <View style={styles.section}>
                    <TextField
                        ref={c => this._title = c}
                        flat={true}
                        value={this.state.title}
                        onChangeText={(text) => this.setState({title:text})}
                        placeholder={this.target.title || '适合自己的计划才是最好的计划...'}
                        returnKeyType="done"
                    />
                    <View style={styles.separator} />
                    <TextArea
                        flat={true}
                        value={this.state.detail}
                        onChangeText={(text) => this.setState({detail:text})}
                        placeholder={this.target.detail || '如有其它信息可填写...'}
                        returnKeyType="default"
                    />
                </View>
                <View style={styles.section}>
                    <TouchableOpacity style={styles.sectionRow} onPress={()=> this._selectDateStart()}>
                        <Text style={style.text}>开始日期</Text>
                        <Text style={styles.picker}>{moment(this.state.dateStart).format('YYYY-MM-DD')}</Text>
                    </TouchableOpacity>
                    <DatePicker visible={this.state.showPickerDateStart}
                                date={this.state.dateStart}
                                onDateChange={date => this._onSelectedDateStart(date)} />
                    <View style={styles.separator} />
                    <TouchableOpacity style={styles.sectionRow} onPress={()=> this._selectDateEnd()}>
                        <Text style={style.text}>截止日期</Text>
                        <Text style={styles.picker}>{moment(this.state.dateEnd).format('YYYY-MM-DD')}</Text>
                    </TouchableOpacity>
                    <DatePicker visible={this.state.showPickerDateEnd}
                                date={this.state.dateEnd}
                                onDateChange={date => this._onSelectedDateEnd(date)} />
                    <View style={styles.separator} />
                    <TouchableOpacity style={styles.sectionRow} onPress={()=> this._selectPriority()}>
                        <Text style={style.text}>优先级</Text>
                        <Text style={styles.picker}>{Objective.getPriorityName(this.state.priority)}</Text>
                    </TouchableOpacity>
                    <PriorityPicker visible={this.state.showPickerPriority}
                                    small={true}
                                    selectedValue={this.state.priority}
                                    onValueChange={value => this._onSelectedPriority(value)}/>
                </View>
                <View style={styles.section}>
                    <TouchableOpacity style={styles.sectionRow} onPress={()=> this._selectFrequency()}>
                        <Text style={style.text}>重复周期</Text>
                        <Text style={styles.picker}>{Objective.getFrequencyName(this.state.frequency)}</Text>
                    </TouchableOpacity>
                    <OptionsPicker visible={this.state.showPickerFrequency}
                                   options={Objective.frequency}
                                   selectedValue={this.state.frequency}
                                   onValueChange={value => this._onSelectedFrequency(value)}/>
                    <View style={styles.separator} />
                    <View style={styles.sectionRow}>
                        <Text style={style.text}>周期指标</Text>
                        <TextField
                            flat={true}
                            value={'' + this.state.times}
                            onChangeText={(text) => this.setState({times:text})}
                            placeholder={'' + this.target.times}
                            returnKeyType="done"
                            keyboardType='number-pad'
                            style={styles.inputR}
                        />
                    </View>
                    <View style={styles.separator} />
                    <TouchableOpacity style={styles.sectionRow} onPress={()=> this._selectUnit()}>
                        <Text style={style.text}>指标类型</Text>
                        <Text style={styles.picker}>{Objective.getUnitName(this.state.unit)}</Text>
                    </TouchableOpacity>
                    <OptionsPicker visible={this.state.showPickerUnit}
                                   options={Objective.unit}
                                   selectedValue={this.state.unit}
                                   onValueChange={value => this._onSelectedUnit(value)}/>
                </View>
                <TouchableOpacity style={styles.row} onPress={()=> this._save()}>
                    <Text style={styles.link}>保存</Text>
                </TouchableOpacity>
            </ScrollView>
        );
    }

    render() {
        let view = null;
        switch (this.target.type) {
            case '1':
                view = this._renderDay();
                break;
            case '2':
                view = this._renderMonth();
                break;
            case '3':
                view = this._renderYear();
                break;
            case '4':
                view = this._renderAction();
                break;
            case '5':
                view = this._renderTime();
                break;
            default :
                view = this._renderCustom();
                break;
        }
        return view;
    }

    _selectPriority() {
        this.setState({
            showPickerDateStart: false,
            showPickerDateEnd: false,
            showPickerUnit: false,
            showPickerFrequency: false,
            showPickerPriority: !this.state.showPickerPriority
        });
    }

    _onSelectedPriority(value) {
        this.setState({
            priority: value,
            showPickerPriority: false
        });
    }

    _selectUnit() {
        this.setState({
            showPickerDateStart: false,
            showPickerDateEnd: false,
            showPickerPriority: false,
            showPickerFrequency: false,
            showPickerUnit: !this.state.showPickerUnit
        });
    }

    _onSelectedUnit(value) {
        this.setState({
            unit: value,
            showPickerUnit: false
        });
    }

    _selectFrequency() {
        this.setState({
            showPickerDateStart: false,
            showPickerDateEnd: false,
            showPickerUnit: false,
            showPickerPriority: false,
            showPickerFrequency: !this.state.showPickerFrequency
        });
    }

    _onSelectedFrequency(value) {
        this.setState({
            frequency: value,
            showPickerFrequency: false
        });
    }

    _selectDateStart() {
        this.setState({
            showPickerPriority: false,
            showPickerDateEnd: false,
            showPickerUnit: false,
            showPickerFrequency: false,
            showPickerDateStart: !this.state.showPickerDateStart
        });
    }

    _onSelectedDateStart(value) {
        this.setState({
            dateStart: value
        });
    }

    _selectDateEnd() {
        this.setState({
            showPickerPriority: false,
            showPickerDateStart: false,
            showPickerUnit: false,
            showPickerFrequency: false,
            showPickerDateEnd: !this.state.showPickerDateEnd
        });
    }

    _onSelectedDateEnd(value) {
        this.setState({
            dateEnd: value
        });
    }

    componentWillUpdate(props, state) {
        if (state.showPickerPriority !== this.state.showPickerPriority
            || state.showPickerDateEnd !== this.state.showPickerDateEnd
            || state.showPickerDateStart !== this.state.showPickerDateStart
            || state.showPickerUnit !== this.state.showPickerUnit
            || state.showPickerFrequency !== this.state.showPickerFrequency ) {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.linear);
        }
    }

    componentDidMount() {
        let route = this.props.navigator.navigationContext.currentRoute;
        if ( route.rightButtonIcon ) {
            route.onRightButtonPress = () => this._toDelete();
            this.props.navigator.replace(route);
        }
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