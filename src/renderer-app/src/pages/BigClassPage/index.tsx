import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import { observer } from "mobx-react-lite";
import { message } from "antd";
import classNames from "classnames";
import { RoomPhase, ViewMode } from "white-web-sdk";

import InviteButton from "../../components/InviteButton";
import { TopBar, TopBarDivider } from "../../components/TopBar";
import { TopBarRightBtn } from "../../components/TopBarRightBtn";
import { RealtimePanel } from "../../components/RealtimePanel";
import { ChatPanel } from "../../components/ChatPanel";
import { BigClassAvatar } from "./BigClassAvatar";
import { NetworkStatus } from "../../components/NetworkStatus";
import { RecordButton } from "../../components/RecordButton";
import { RoomInfo } from "../../components/RoomInfo";
import { TopBarRoundBtn } from "../../components/TopBarRoundBtn";
import { ExitRoomConfirm, ExitRoomConfirmType } from "../../components/ExitRoomConfirm";
import { Whiteboard } from "../../components/Whiteboard";
import LoadingPage from "../../LoadingPage";
import { RoomStatus, RoomType } from "../../apiMiddleware/flatServer/constants";
import { useWhiteboardStore } from "../../stores/WhiteboardStore";
import { RecordingConfig, useClassRoomStore, User } from "../../stores/ClassRoomStore";
import { RtcChannelType } from "../../apiMiddleware/Rtc";
import { ipcAsyncByMain } from "../../utils/ipc";
import { useAutoRun } from "../../utils/mobx";
import { RouteNameType, RouteParams, usePushHistory } from "../../utils/routes";

import "./BigClassPage.less";

const recordingConfig: RecordingConfig = Object.freeze({
    channelType: RtcChannelType.Broadcast,
    transcodingConfig: {
        width: 288,
        height: 216,
        // https://docs.agora.io/cn/cloud-recording/recording_video_profile
        fps: 15,
        bitrate: 280,
        mixedVideoLayout: 3,
        backgroundColor: "#000000",
        layoutConfig: [
            {
                x_axis: 0,
                y_axis: 0,
                width: 1,
                height: 1,
                alpha: 1.0,
                render_mode: 1,
            },
            {
                x_axis: 0.0,
                y_axis: 0.67,
                width: 0.33,
                height: 0.33,
                alpha: 1.0,
                render_mode: 1,
            },
        ],
    },
    maxIdleTime: 60,
    subscribeUidGroup: 0,
});

export type BigClassPageProps = {};

export const BigClassPage = observer<BigClassPageProps>(function BigClassPage() {
    // @TODO remove ref
    const exitRoomConfirmRef = useRef((_confirmType: ExitRoomConfirmType) => {});

    const params = useParams<RouteParams<RouteNameType.BigClassPage>>();
    const pushHistory = usePushHistory();

    const classRoomStore = useClassRoomStore(params.roomUUID, params.ownerUUID, recordingConfig);
    const whiteboardStore = useWhiteboardStore(classRoomStore.isCreator);

    const [speakingJoiner, setSpeakingJoiner] = useState<User | undefined>(() =>
        classRoomStore.speakingJoiners.length > 0 ? classRoomStore.speakingJoiners[0] : void 0,
    );
    const [mainSpeaker, setMainSpeaker] = useState<User | undefined>(speakingJoiner);
    const [isRealtimeSideOpen, openRealtimeSide] = useState(true);

    useEffect(() => {
        ipcAsyncByMain("set-win-size", {
            width: 1200,
            height: 700,
        });
    }, []);

    useAutoRun(() => {
        if (classRoomStore.roomStatus === RoomStatus.Stopped) {
            pushHistory(RouteNameType.UserIndexPage, {});
        }
    });

    useAutoRun(reaction => {
        if (classRoomStore.currentUser) {
            if (!classRoomStore.isCreator && !classRoomStore.isCalling) {
                // join rtc room to listen to creator events
                classRoomStore.toggleCalling();
            }
            // run only once
            reaction.dispose();
        }
    });

    // control whiteboard writable
    useAutoRun(reaction => {
        // ignore creator
        if (classRoomStore.isCreator) {
            reaction.dispose();
            return;
        }
        if (whiteboardStore.room && classRoomStore.currentUser) {
            const isWritable = classRoomStore.currentUser.isSpeak;
            if (whiteboardStore.room.disableDeviceInputs === isWritable) {
                whiteboardStore.room.disableDeviceInputs = !isWritable;
                whiteboardStore.room.setWritable(isWritable);
            }
        }
    });

    useAutoRun(() => {
        // only one user is allowed to speak in big class
        if (classRoomStore.speakingJoiners.length <= 0) {
            return;
        }
        const user = classRoomStore.speakingJoiners[0];

        const speak = user.camera || user.mic;

        setSpeakingJoiner(speak ? user : void 0);
        setMainSpeaker(speak ? user : void 0);

        // is current user speaking
        if (classRoomStore.userUUID === user.userUUID) {
            classRoomStore.rtc.rtcEngine.setClientRole(speak ? 1 : 2);
        }
    });

    if (
        !whiteboardStore.room ||
        whiteboardStore.phase === RoomPhase.Connecting ||
        whiteboardStore.phase === RoomPhase.Disconnecting ||
        whiteboardStore.phase === RoomPhase.Reconnecting
    ) {
        return <LoadingPage />;
    }

    return (
        <div className="realtime-box">
            <TopBar
                left={renderTopBarLeft()}
                center={renderTopBarCenter()}
                right={renderTopBarRight()}
            />
            <div className="realtime-content">
                <Whiteboard whiteboardStore={whiteboardStore} />
                {renderRealtimePanel()}
            </div>
            <ExitRoomConfirm
                isCreator={classRoomStore.isCreator}
                roomStatus={classRoomStore.roomStatus}
                stopClass={classRoomStore.stopClass}
                confirmRef={exitRoomConfirmRef}
            />
        </div>
    );

    function renderTopBarLeft(): React.ReactNode {
        return (
            <>
                <NetworkStatus />
                {!classRoomStore.isCreator && (
                    <RoomInfo roomStatus={classRoomStore.roomStatus} roomType={RoomType.BigClass} />
                )}
            </>
        );
    }

    function renderTopBarCenter(): React.ReactNode {
        if (!classRoomStore.isCreator) {
            return null;
        }

        switch (classRoomStore.roomStatus) {
            case RoomStatus.Started:
                return (
                    <>
                        <TopBarRoundBtn iconName="class-pause" onClick={classRoomStore.pauseClass}>
                            暂停上课
                        </TopBarRoundBtn>
                        <TopBarRoundBtn iconName="class-stop" onClick={stopClass}>
                            结束上课
                        </TopBarRoundBtn>
                    </>
                );
            case RoomStatus.Paused:
                return (
                    <>
                        <TopBarRoundBtn iconName="class-pause" onClick={classRoomStore.resumeClass}>
                            恢复上课
                        </TopBarRoundBtn>
                        <TopBarRoundBtn iconName="class-stop" onClick={stopClass}>
                            结束上课
                        </TopBarRoundBtn>
                    </>
                );
            default:
                return (
                    <TopBarRoundBtn iconName="class-begin" onClick={classRoomStore.startClass}>
                        开始上课
                    </TopBarRoundBtn>
                );
        }
    }

    function renderTopBarRight(): React.ReactNode {
        return (
            <>
                {classRoomStore.isCreator &&
                    (classRoomStore.roomStatus === RoomStatus.Started ||
                        classRoomStore.roomStatus === RoomStatus.Paused) && (
                        <RecordButton
                            disabled={false}
                            isRecording={classRoomStore.isRecording}
                            onClick={classRoomStore.toggleRecording}
                        />
                    )}
                {classRoomStore.isCreator && (
                    <TopBarRightBtn
                        title="Call"
                        icon="phone"
                        active={classRoomStore.isCalling}
                        onClick={toggleCalling}
                    />
                )}
                <TopBarRightBtn
                    title="Vision control"
                    icon="follow"
                    active={whiteboardStore.viewMode === ViewMode.Broadcaster}
                    onClick={handleRoomController}
                />
                <TopBarRightBtn
                    title="Docs center"
                    icon="folder"
                    onClick={whiteboardStore.toggleFileOpen}
                />
                <InviteButton uuid={classRoomStore.roomUUID} />
                {/* @TODO implement Options menu */}
                <TopBarRightBtn title="Options" icon="options" onClick={() => {}} />
                <TopBarRightBtn
                    title="Exit"
                    icon="exit"
                    onClick={() => {
                        // @TODO remove ref
                        exitRoomConfirmRef.current(ExitRoomConfirmType.ExitButton);
                    }}
                />
                <TopBarDivider />
                <TopBarRightBtn
                    title="Open side panel"
                    icon="hide-side"
                    active={isRealtimeSideOpen}
                    onClick={handleSideOpenerSwitch}
                />
            </>
        );
    }

    function renderRealtimePanel(): React.ReactNode {
        const { creator } = classRoomStore;
        const isVideoOn = classRoomStore.isCreator
            ? classRoomStore.isCalling
            : !!classRoomStore.creator?.isSpeak;

        return (
            <RealtimePanel
                isShow={isRealtimeSideOpen}
                isVideoOn={isVideoOn}
                videoSlot={
                    creator &&
                    isVideoOn && (
                        <div
                            className={classNames("whiteboard-rtc-box", {
                                "with-small": speakingJoiner,
                            })}
                        >
                            <div
                                className={classNames("whiteboard-rtc-avatar", {
                                    "is-small":
                                        mainSpeaker && mainSpeaker.userUUID !== creator.userUUID,
                                })}
                            >
                                <BigClassAvatar
                                    isCreator={classRoomStore.isCreator}
                                    userUUID={classRoomStore.userUUID}
                                    avatarUser={creator}
                                    rtcEngine={classRoomStore.rtc.rtcEngine}
                                    updateDeviceState={classRoomStore.updateDeviceState}
                                    small={mainSpeaker && mainSpeaker.userUUID !== creator.userUUID}
                                    onExpand={onVideoAvatarExpand}
                                />
                            </div>
                            {speakingJoiner && (
                                <div
                                    className={classNames("whiteboard-rtc-avatar", {
                                        "is-small": mainSpeaker !== speakingJoiner,
                                    })}
                                >
                                    <BigClassAvatar
                                        isCreator={classRoomStore.isCreator}
                                        avatarUser={speakingJoiner}
                                        userUUID={classRoomStore.userUUID}
                                        rtcEngine={classRoomStore.rtc.rtcEngine}
                                        updateDeviceState={classRoomStore.updateDeviceState}
                                        small={mainSpeaker !== speakingJoiner}
                                        onExpand={onVideoAvatarExpand}
                                    />
                                </div>
                            )}
                        </div>
                    )
                }
                chatSlot={
                    <ChatPanel
                        classRoomStore={classRoomStore}
                        allowMultipleSpeakers={false}
                    ></ChatPanel>
                }
            />
        );
    }

    function handleRoomController(): void {
        const { room } = whiteboardStore;
        if (!room) {
            return;
        }
        if (room.state.broadcastState.mode !== ViewMode.Broadcaster) {
            room.setViewMode(ViewMode.Broadcaster);
            message.success("其他用户将跟随您的视角");
        } else {
            room.setViewMode(ViewMode.Freedom);
            message.success("其他用户将停止跟随您的视角");
        }
    }

    function handleSideOpenerSwitch(): void {
        openRealtimeSide(isRealtimeSideOpen => !isRealtimeSideOpen);
    }

    function onVideoAvatarExpand(): void {
        setMainSpeaker(mainSpeaker =>
            mainSpeaker?.userUUID === classRoomStore.creator?.userUUID
                ? speakingJoiner
                : classRoomStore.creator ?? void 0,
        );
    }

    async function toggleCalling(): Promise<void> {
        if (!classRoomStore.currentUser) {
            return;
        }

        await classRoomStore.toggleCalling();

        const speakConfigs: Array<{ userUUID: string; speak: boolean }> = [
            { userUUID: classRoomStore.userUUID, speak: classRoomStore.isCalling },
        ];

        if (classRoomStore.isCalling) {
            openRealtimeSide(true);
        } else {
            speakConfigs.push(
                ...classRoomStore.speakingJoiners.map(user => ({
                    userUUID: user.userUUID,
                    speak: false,
                })),
            );
        }
        classRoomStore.onSpeak(speakConfigs);
    }

    function stopClass(): void {
        // @TODO remove ref
        exitRoomConfirmRef.current(ExitRoomConfirmType.StopClassButton);
    }
});

export default BigClassPage;
