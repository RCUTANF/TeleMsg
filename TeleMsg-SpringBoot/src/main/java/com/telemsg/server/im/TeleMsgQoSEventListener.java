package com.telemsg.server.im;

import lombok.extern.slf4j.Slf4j;
import net.x52im.mobileimsdk.server.event.MessageQoSEventListenerS2C;
import net.x52im.mobileimsdk.server.protocal.Protocal;
import org.springframework.stereotype.Component;

import java.util.ArrayList;

/**
 * TeleMsg QoS事件监听器
 *
 * @author TeleMsg Team
 */
@Slf4j
@Component
public class TeleMsgQoSEventListener implements MessageQoSEventListenerS2C {

    public void messagesLost(String toUserId, String[] lostMessages) {
        if (lostMessages == null || lostMessages.length == 0) {
            return;
        }

        log.warn("消息发送丢失: toUserId={}, lostCount={}", toUserId, lostMessages.length);

        // 这里可以实现消息丢失的处理逻辑
        // 比如重新尝试发送、记录日志、通知相关服务等
        for (String messageId : lostMessages) {
            if (messageId != null && !messageId.trim().isEmpty()) {
                log.warn("丢失的消息ID: {}, 目标用户: {}", messageId, toUserId);

                // 具体处理逻辑:
                // 1. 更新消息状态为发送失败
                // 2. 触发重发机制
                // 3. 通知发送方
                // 4. 记录错误统计
            }
        }
    }

    @Override
    public void messagesLost(ArrayList<Protocal> lostProtocals) {
        if (lostProtocals == null || lostProtocals.isEmpty()) {
            return;
        }

        log.warn("协议消息发送丢失: 消息数量={}", lostProtocals.size());

        // 处理丢失的协议消息
        for (Protocal protocal : lostProtocals) {
            if (protocal != null) {
                log.warn("丢失的协议消息: from={}, to={}, fingerPrint={}, content={}",
                    protocal.getFrom(),
                    protocal.getTo(),
                    protocal.getFp(),
                    protocal.getDataContent());

                // 这里可以实现具体的消息丢失处理逻辑:
                // 1. 记录到数据库
                // 2. 尝试重新发送
                // 3. 通知相关服务
                // 4. 统计分析等
            }
        }
    }

    @Override
    public void messagesBeReceived(String theFingerPrint) {
        if (theFingerPrint == null || theFingerPrint.trim().isEmpty()) {
            log.warn("收到空的消息指纹码，忽略处理");
            return;
        }

        log.debug("消息已被接收确认: fingerPrint={}", theFingerPrint);

        // 消息送达确认，可以在这里更新消息状态为已送达
        try {
            // 这里可以调用MessageService更新消息状态
            // messageService.updateMessageStatus(theFingerPrint, MessageStatus.DELIVERED);

            // 或者触发其他相关处理:
            // 1. 更新消息投递状态
            // 2. 通知发送方消息已送达
            // 3. 更新统计信息
            // 4. 清理重发队列中的相关消息

        } catch (Exception e) {
            log.error("处理消息接收确认时出错: fingerPrint={}", theFingerPrint, e);
        }
    }
}
